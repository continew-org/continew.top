# 官网数据源维护说明

本目录存放官网各页面的结构化数据，均为 JSON。由 `lib/*.ts` 读取，在**构建期**渲染成静态页面——改完 JSON 重新构建即生效，不需要动页面代码。

## 文件与页面的对应关系

| 文件 | 页面 | 读取逻辑 |
|:-----|:-----|:---------|
| `timeline.json` | `/timeline` 发展历程 | `lib/timeline.ts` |
| `users.json` | `/users` 登记用户 | `lib/users.ts` |
| `members-core.json` / `members-partner.json` / `members-emeriti.json` | `/team` 社区团队 | `lib/team.ts` |
| `sponsors.json` | `/sponsor` 赞助 | `lib/sponsors.ts` |
| `messages.json` | 首页「用户留言」区块 | `lib/messages.ts` |

---

## timeline.json：发展历程

一条记录就是一个里程碑事件。

```json
{
  "date": "2025-12-31",
  "logo": "/images/about/timeline/gitcode.webp",
  "title": "AtomGit - 2025 年度 G-Star 开源组织",
  "desc": "ContiNew 获 2025 年度 G-Star 开源组织第 35 名",
  "type": "star",
  "attaches": ["/images/about/timeline/2025/2025_gitcode-g-star-org-35.webp"]
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|:-----|:--:|:-----|
| `date` | 是 | `YYYY-MM-DD`。**页面会自动按日期倒序、按年份分组**，写的时候不用管顺序 |
| `title` | 是 | 一句话说清事件 |
| `desc` | 否 | 补充说明，建议写具体名次、数量、天数，比形容词有说服力 |
| `logo` | 否 | 平台图标，显示在日期后面。可选值见下 |
| `type` | 否 | 事件类型，决定徽章样式和是否被计入「平台荣誉」 |
| `attaches` | 否 | 附件图片路径数组，可点击放大 |

### type 取值

| 值 | 页面徽章 | 实际含义 | 当前条数 |
|:---|:---------|:---------|--------:|
| `honor` | 荣誉 | 平台 / 机构授予的荣誉：榜单、奖项、计划认证 | 3 |
| `star` | Star | Star 数达成 | 7 |
| `great` | 里程碑 | 重大版本发布（v1.0.0 ~ v4.0.0） | 5 |
| 不填 | 无 | 其他：社区活动、数据节点、组织事务 | 11 |

**判定口径**：只有「外部授予的认可」才算 `honor` —— G-Star 榜单、百大开源项目、G-Star 计划毕业这类。
自己发版本（`great`）、自己达成 Star（`star`）、参加活动、PV / 提交数突破，都不算平台荣誉。

### logo 可选值

- `/images/about/timeline/github.webp` — GitHub
- `/images/about/timeline/gitee.ico` — Gitee
- `/images/about/timeline/gitcode.webp` — GitCode / AtomGit
- `/images/about/timeline/logo.svg` — ContiNew 自身

新增平台时把图标放进 `public/images/about/timeline/` 即可。

### 图片存放位置

| 类型 | 路径 |
|:-----|:-----|
| 平台图标 | `public/images/about/timeline/` |
| 事件附件 | `public/images/about/timeline/<年份>/` |

命名建议：`YYYYMMDD_事件简述.webp`，多张追加 `_1` `_2`。

**图片统一转 WebP 再提交**（单张建议 ≤ 500 KB）：Git 存二进制不划算，每次改动都会多一份全量副本。
压缩脚本见 `.workbuddy/scripts/compress-images.py`（不入库，改路径常量即可复用）。
注意转完要确认是真 WebP——只改后缀、内容仍是 PNG 的话浏览器会解析失败。

---

## 页面顶部的统计数字怎么来的

**都不用手动维护**，改 JSON 后自动跟着变：

| 数字 | 计算方式 |
|:-----|:---------|
| 累计 Star | 构建期自动拉取 GitHub / Gitee / AtomGit 三平台求和；拉取失败回落到 `lib/site-stats.ts` 的 `SNAPSHOT` |
| 持续维护（天） | `maintenanceStartDate`（2022-12-08）到构建当天 |
| 平台荣誉 | `type` 为 `honor` 或 `star` 的条目数。当前 = 3 项平台奖项 + 7 次 Star 里程碑 = **10** |

### 关于累计 Star

- 拉取逻辑集中在 `lib/site-stats.ts`，三平台的组织路径也在那里（GitHub 为 `continew-org`，Gitee / AtomGit 为 `continew`）
- 构建时可通过环境变量 `GITHUB_TOKEN` 提高 GitHub API 限流额度（未认证 60 次/小时）
- 如果 CI 连不上某个平台，会静默回落到快照值，构建不会失败——**但数字会变旧**，建议发版前核对 `SNAPSHOT` 是否明显过期

---

## messages.json：首页用户留言

首页「用过的人怎么说」区块的数据源。一条记录就是一条留言。

```json
{
  "content": "Starter 抽出来之后，新项目直接引依赖就行，不用再从老项目里拷一堆配置。",
  "author": "王工",
  "title": "技术架构师",
  "region": "郑州",
  "avatar": "",
  "platform": "gitee",
  "url": "",
  "createdAt": "2026-04-02"
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|:-----|:--:|:-----|
| `content` | 是 | 留言正文。建议 ≤ 60 字，过长会撑破卡片高度 |
| `author` | 是 | 署名，如「王工」。缺正文或缺署名的条目会被自动过滤掉 |
| `title` | 否 | 身份 / 职位，与 `region` 拼成一行副标题 |
| `region` | 否 | 所在城市 |
| `avatar` | 否 | 头像地址；留空时退化为首字方块 |
| `platform` | 否 | 留言出处，仅作来源标注，不用于跳转 |
| `url` | 否 | 原留言链接；留空则卡片不可点 |
| `createdAt` | 否 | `YYYY-MM-DD`，用于排序（新的在前） |

### 维护约定

**这个文件的条目必须逐条人工审核后再录入。** 留言会出现在官网首页，等同于对外背书——
自动抓取会混入提问、灌水与无意义回复，宁可少更，不可失控。

来源建议：官方交流群、Gitee 登记帖（I8NIGW）、各项目 Issue 中的正向反馈。
摘录时保留原意，可压缩字数，但**不要改写语气、不要替用户加工评价**。

当前库里的 3 条是版式示例，上线前需替换为真实留言。留言少于 8 条时跑马灯会显得空，建议先攒够再上。
