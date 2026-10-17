#!/usr/bin/env bash
# relay-pr.sh — 把 Gitee / AtomGit 的 PR 搬到 GitHub，保留原作者。
#
# 在 continew.top 仓库里执行，第三个参数指向目标仓库的本地克隆：
#   relay-pr.sh <gitee|atomgit> <PR号> [仓库目录] [目标分支]
#   DRY_RUN=1 relay-pr.sh atomgit 10 ../continew-admin dev
#   KEEP_BRANCH=1 relay-pr.sh ...      # 失败时保留本地 relay 分支便于排查
#
# head 抓取：先试 refs/pull/<N>/head，再试贡献者 fork 的源分支，
# 取与平台 API 的 head.sha 一致的那个（两个平台的权威源并不固定）。
# 只创建 relay/<平台>-<PR号> 分支并开 PR，不合并。
# 合并时必须用 merge commit 或 rebase，不要 squash（squash 会把作者记成操作者）。
set -euo pipefail
export PYTHONIOENCODING=utf-8

if [ $# -lt 2 ]; then
  echo "用法: relay-pr.sh <gitee|atomgit> <PR号> [仓库目录] [目标分支]" >&2
  echo "例子: relay-pr.sh gitee 83 ../continew-admin dev" >&2
  exit 1
fi

PLATFORM="$1"
PR="$2"
REPO_DIR="${3:-.}"
BASE="${4:-dev}"
DRY_RUN="${DRY_RUN:-0}"

cd "$REPO_DIR"

# origin 必须是官方仓库，避免在 fork 克隆里把 PR 开到 continew-org
ORIGIN_URL="$(git remote get-url origin)"
case "$ORIGIN_URL" in
  *github.com[:/]continew-org/*) ;;
  *)
    echo "❌ origin 不是 continew-org 的仓库：$ORIGIN_URL" >&2
    exit 1
    ;;
esac
REPO=$(basename "$ORIGIN_URL" .git)
GH_REPO="continew-org/$REPO"

case "$PLATFORM" in
  gitee)
    HOST="gitee.com"
    API="https://gitee.com/api/v5"
    ;;
  atomgit)
    HOST="atomgit.com"
    # 产品名是 AtomGit，API 仍在 GitCode 域名下，勿“修正”成 atomgit.com
    API="https://gitcode.com/api/v5"
    ;;
  *)
    echo "平台只能是 gitee 或 atomgit" >&2
    exit 1
    ;;
esac
SRC="https://$HOST/continew/$REPO.git"
PR_URL="https://$HOST/continew/$REPO/pulls/$PR"

CURL=(curl -fsSL)
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) CURL+=(--ssl-no-revoke) ;;
esac
if [ -n "${PLATFORM_TOKEN:-}" ]; then
  case "$PLATFORM" in
    gitee) CURL+=(-H "Authorization: token $PLATFORM_TOKEN") ;;
    atomgit) CURL+=(-H "PRIVATE-TOKEN: $PLATFORM_TOKEN") ;;
  esac
fi

json_get() {
  local expr="$1" out
  if ! out="$(python -c "import sys,json;d=json.load(sys.stdin);v=($expr);print('' if v is None else v)" 2>&1)"; then
    echo "❌ 解析 PR JSON 失败（$expr）：$out" >&2
    return 1
  fi
  printf '%s\n' "$out"
}

BRANCH="relay/$PLATFORM-$PR"
TMPREF="refs/relay-src/$PLATFORM-$PR"
ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
ORIG_SHA=""
if [ "$ORIG_BRANCH" = "HEAD" ]; then
  ORIG_SHA=$(git rev-parse HEAD)
fi

restore() {
  if [ -n "$ORIG_SHA" ]; then
    git checkout -q -f --detach "$ORIG_SHA" 2>/dev/null || true
  else
    git checkout -q -f "$ORIG_BRANCH" 2>/dev/null || true
  fi
}

cleanup() {
  restore
  if [ "${KEEP_BRANCH:-0}" != "1" ]; then
    git branch -D "$BRANCH" >/dev/null 2>&1 || true
  fi
  git update-ref -d "$TMPREF" >/dev/null 2>&1 || true
}

if [ -n "$(git status --porcelain)" ]; then
  echo "❌ 工作区有未提交改动，请先处理" >&2
  exit 1
fi

# 工作区干净后才挂恢复钩子，避免退出时 -f 丢弃用户改动
trap cleanup EXIT

if [ "$DRY_RUN" != "1" ]; then
  command -v gh >/dev/null 2>&1 || { echo "❌ 未安装 gh CLI" >&2; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "❌ gh 未登录，请先执行 gh auth login" >&2; exit 1; }
fi

echo "==> 读取 $PLATFORM PR #$PR 的 head"
PR_JSON="$("${CURL[@]}" "$API/repos/continew/$REPO/pulls/$PR")" || {
  echo "❌ 无法读取 PR 信息：$API/repos/continew/$REPO/pulls/$PR" >&2
  exit 1
}
HEAD_SHA="$(json_get "((d.get('head') or {}).get('sha')) or ''" <<<"$PR_JSON")"
HEAD_REPO="$(json_get "(((d.get('head') or {}).get('repo')) or {}).get('full_name') or ''" <<<"$PR_JSON")"
HEAD_REF="$(json_get "((d.get('head') or {}).get('ref')) or ''" <<<"$PR_JSON")"
PR_STATE="$(json_get "d.get('state') or ''" <<<"$PR_JSON")"
API_PR_URL="$(json_get "d.get('html_url') or ''" <<<"$PR_JSON")"
PR_URL="${API_PR_URL:-$PR_URL}"

case "$PR_STATE" in
  open) ;;
  merged) echo "⚠️  PR 已合并；若改动已进入主线，会因「没有可搬运的改动」退出" ;;
  closed)
    echo "❌ PR 已被关闭，不再搬运；如确需搬运请人工确认后手工处理" >&2
    exit 1
    ;;
  *) echo "⚠️  未知 PR 状态：$PR_STATE，仍尝试搬运" ;;
esac

if [ -z "$HEAD_SHA" ]; then
  echo "❌ 无法解析 PR head（可能已删除或 API 结构变化）" >&2
  exit 1
fi

try_fetch() {
  git fetch --force "$1" "$2" >/dev/null 2>&1 || return 1
  [ "$(git rev-parse "$TMPREF" 2>/dev/null)" = "$HEAD_SHA" ]
}

echo "==> 抓取 head（API: $HEAD_SHA）"
if try_fetch "$SRC" "refs/pull/$PR/head:$TMPREF"; then
  echo "    来源: 本仓库 refs/pull/$PR/head"
elif [ -n "$HEAD_REPO" ] && [ -n "$HEAD_REF" ] \
     && try_fetch "https://$HOST/$HEAD_REPO.git" "refs/heads/$HEAD_REF:$TMPREF"; then
  echo "    来源: fork $HEAD_REPO ($HEAD_REF)"
else
  echo "❌ refs/pull 与 fork 源分支都拿不到与 API 一致的 head（$HEAD_SHA），已停止" >&2
  exit 1
fi

git fetch --force origin "$BASE"

AUTHOR=$(git log -1 --format='%an <%ae>' "$TMPREF")
SUBJECT=$(git log -1 --format='%s' "$TMPREF")
echo "    作者: $AUTHOR"
echo "    标题: $SUBJECT"

echo "==> 基于 origin/$BASE 重建"
git checkout -B "$BRANCH" "$TMPREF" >/dev/null
if ! git merge-base --is-ancestor "origin/$BASE" "$BRANCH"; then
  echo "    分支落后于 origin/$BASE，执行 rebase"
  if ! git rebase "origin/$BASE"; then
    echo "❌ rebase 有冲突，请手工解决后重跑（已回到原分支）" >&2
    git rebase --abort 2>/dev/null || true
    exit 1
  fi
fi

BASE_SHA=$(git merge-base "origin/$BASE" "$BRANCH")
COAUTHORS=$(git log --format='Co-authored-by: %an <%ae>' "$BASE_SHA..$BRANCH" | tail -n +2 | sort -u || true)

echo "==> 压缩为单个提交（author 指向原贡献者）"
git reset --soft "$BASE_SHA"
if git diff --quiet --cached; then
  echo "❌ 没有可搬运的改动（PR 可能已合并或为空）" >&2
  exit 1
fi
git commit --author="$AUTHOR" -m "$SUBJECT

原 PR: $PR_URL
${COAUTHORS:+
$COAUTHORS}"
git show --no-patch --format='    author: %an <%ae>
    subject: %s' HEAD

if [ "$DRY_RUN" = "1" ]; then
  echo "🧪 dry-run：已重建并压缩，未推送、未创建 PR；完整改动如下"
  git show HEAD
  exit 0
fi

echo "==> 推送 $BRANCH"
git fetch --force origin "$BRANCH" 2>/dev/null || true
git push --force-with-lease -u origin "$BRANCH"

if gh pr view "$BRANCH" --repo "$GH_REPO" >/dev/null 2>&1; then
  echo "ℹ️  PR 已存在：$(gh pr view "$BRANCH" --repo "$GH_REPO" --json url -q .url)"
else
  echo "==> 创建 PR"
  gh pr create --repo "$GH_REPO" --head "$BRANCH" --base "$BASE" \
    --title "$SUBJECT" \
    --body "Original author: $AUTHOR
原 PR: $PR_URL

> 从 $PLATFORM 搬运。合并请用 **merge commit** 或 **rebase**，不要 squash。"
fi
