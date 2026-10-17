---
name: ocn-pr-relay
description: 把 Gitee 或 AtomGit 上的社区 PR 搬运到 GitHub 主线，保留原作者与提交时间。当需要处理来自 Gitee / AtomGit 的 PR、把非 GitHub 平台的贡献并入 GitHub 工作流、或判断某个外部 PR 是否值得搬运时使用。搬运前必须先看本技能「搬不搬」一节。
---

# 跨平台 PR 搬运

ContiNew 的代码只有 GitHub 一个写入点：镜像平台（Gitee / AtomGit）是只读副本，在那里合并会与单向镜像冲突。但国内贡献者习惯在 Gitee / AtomGit 提 PR，所以需要把有价值的 PR 搬过来。

**搬运是一次性动作**：搬完就把原 PR 评论并关闭，后续评审、修复、合并全在 GitHub 做，不需要再搬第二次。

## 一、搬不搬

先判断，不要见到 PR 就搬：

| 情况 | 处理 |
|:--|:--|
| 实质性代码改动，且方向可接受 | ✅ 搬运 |
| 文档错别字、单行修正 | ⚠️ 不必搬，直接在 GitHub 重做或让作者来提 |
| 与已有 PR 重复、方向不符 | ❌ 在原平台礼貌说明并关闭 |
| 涉及安全敏感改动（凭据、加密、鉴权） | ⚠️ 先人工评审再搬 |

搬运后代码要过 GitHub 的 CI、CLA 校验与 AI 评审，所以**方向不对的 PR 搬过来只会浪费一次流水线**。

## 二、怎么搬

在 **continew.top 仓库里**执行，第三个参数指向目标仓库的本地克隆（需要 `gh auth login`）：

```bash
# 先演练：重建、压缩并输出完整 diff，不推送、不开 PR
DRY_RUN=1 bash .agents/skills/ocn-pr-relay/scripts/relay-pr.sh atomgit 10 ../continew-admin dev

# 确认无误后正式搬运
bash .agents/skills/ocn-pr-relay/scripts/relay-pr.sh atomgit 10 ../continew-admin dev
```

脚本做的事：

1. 通过平台 API 解析 PR 的真实 head，依次尝试 `refs/pull/<N>/head` 与贡献者 fork 的源分支，取与 API `head.sha` 一致的那个——两个平台的权威源并不固定：Gitee 可能是 `refs/pull` 新、fork 已漂移，AtomGit 可能反过来；
2. 基于 `origin/<目标分支>` 重建，落后则自动 rebase；
3. 压成一个干净提交，`--author` 指向原贡献者，其余作者写进 `Co-authored-by`；
4. 推送 `relay/<平台>-<PR号>` 分支（该分支不在镜像白名单内，不会被推回镜像平台）；
5. 开 GitHub PR，描述里带原作者与原 PR 链接。

公开仓的 API 匿名可读；遇到限流或私有仓时，可设置 `PLATFORM_TOKEN` 环境变量（Gitee 用 `Authorization: token`，AtomGit 用 `PRIVATE-TOKEN`）。

## 三、合并方式（硬性要求）

| 方式 | 结果 |
|:--|:--|
| Create a merge commit | ✅ 保留原提交作者 |
| Rebase and merge | ✅ 保留原提交作者 |
| Squash and merge | ❌ 作者变成执行合并的人 |

命令行用 `gh pr merge --merge` 或 `--rebase`，**不要 `--squash`**。

## 四、收尾

1. 在原平台 PR 下评论：`已转到 GitHub <PR 链接>，后续讨论与合并请在那边进行。`
2. 关闭原 PR。
3. CHANGELOG 里只写 GitHub PR 号；来自其他平台的贡献在该版本末尾加一行不带链接的致谢。

## 五、失败处理

- **rebase 冲突**：脚本会中止并回到原分支。手工解决后重跑，或直接请作者更新分支。
- **PR 已关闭**：脚本直接退出，不搬运；关闭代表维护者已拒绝，需人工确认后再处理。
- **PR 已合并**：脚本仍会尝试；若改动已进入主线，会因「没有可搬运的改动」退出。
- **fork 已删除或不可访问**：`refs/pull` 与 fork 两个源都会尝试；都拿不到与 API 一致的 head 时退出，此时只能请作者重新 fork 或在 GitHub 重做。
- **平台 ref 滞后**：脚本会对比抓取到的 SHA 与 API 的 head SHA，不一致就停止，不会把错误内容推成 PR。
- **分支已存在**：脚本用 `--force-with-lease` 覆盖 `relay/*` 分支，这是安全的（该前缀只由本脚本使用）。
- **作者邮箱未绑定 GitHub 账号**：commit 里作者信息完整，但 GitHub 不会把它计入贡献者。在 PR 描述里保留原平台主页链接即可。
- **仓库要求签名提交**：relay 提交由本机生成，不带签名，启用签名保护后会被拒绝；届时需要手工重签或在保护规则里放行。
- **Windows 符号链接**：PR 涉及 symlink 时，Windows 可能无法检出（`unable to create symlink`），建议在 WSL 或 Linux 下执行搬运。
- **触发镜像空跑**：push `relay/*` 会触发一次 `mirror.yml`（该分支会被过滤，不影响镜像结果）；介意的话可在镜像工作流的 `push` 上加 `branches-ignore: ['relay/**']`。
