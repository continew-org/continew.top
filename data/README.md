# 官网数据源维护说明

本目录存放官网各页面的结构化数据，均为 JSON。由 `lib/*.ts` 读取，在**构建期**渲染成静态页面——改完 JSON 重新构建即生效，不需要动页面代码。

## 文件与页面的对应关系

| 文件 | 页面 | 读取逻辑 |
|:-----|:-----|:---------|
| `timeline.json` | `/timeline` 发展历程 | `lib/timeline.ts` |
| `users.json` | `/users` 登记用户 | `lib/users.ts` |
| `members-core.json` / `members-partner.json` / `members-emeriti.json` | `/team` 社区团队 | `lib/team.ts` |
| `sponsors.json` | `/sponsor` 赞助；`/demo` 页的当前服务器；`sponsor.json` 接口 | `lib/sponsors.ts` |
| `messages.json` | 首页「社区声音」区块 | `lib/messages.ts` |

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

来源建议：官方交流群、Gitee 登记帖（I8NIGW）、各项目 Issue 中的正向反馈，
以及官网仓库的征集帖（continew-org/continew.top#6，帖内已写明展示授权与撤回方式）。
摘录时保留原意，可压缩字数，但**不要改写语气、不要替用户加工评价**。

当前收录的均为征集帖下的真实留言（署名取 GitHub 登录名或昵称）。
---

## sponsors.json：赞助与致谢

`/sponsor` 页的数据源。顶层有三块：`config`（席位上限）、`resourceNeeds`（资源需求清单）、`tiers`（按**关系类型**分三档——是三种关系，不是按金额排的三个等级）：

| 档位 | 含义 | 页面上 |
|:-----|:-----|:-------|
| `strategic` | 开源合作伙伴，**按月**付费，占席位 | 紧凑卡片：Logo + 名称 |
| `infrastructure` | 资源合作伙伴，以**资源**支持（服务器、云资源、额度等），拆成一条条**需求项** | 一行一项：资源 + 数量 + 提供者小标识 + 时间段 |
| `supporter` | 个人支持者 | 小胶囊：小头像 + 名称，**不写任何说明** |

席位只由 `strategic` 占（`config.strategicSeats` 减在支持数 = 页面上的「剩 N 席」），`infrastructure` 与 `supporter` 都不占席。

三种关系各用一种紧凑形态（`components/sponsor/`），不再共用大卡片：

| 组件 | 用途 | 视觉 |
|:-----|:-----|:-----|
| `company-card.tsx`（`CompanyCard`） | 开源合作伙伴 | `size-8` Logo + 名称一行 |
| `resource-card.tsx`（`ResourceNeedCard`） | 资源合作伙伴，**按需求归组** | 一项需求一张卡，`sm:grid-cols-2` 一行两张：卡头是需求图标 + 需求名 + 数量，卡内列出满足过它的全部提供者（`size-9` 标识 + 名字 + 具体提供物 + 时间段，当前在用的置顶带「在用」标记）。同一项需求可多人接力，由 `groupResourceByNeed()` 按 `need` 归组 |
| `supporter-chip.tsx`（`SupporterChips`） | 个人支持者 | 圆角胶囊：`size-6` 小头像 + 名称 |

### resourceNeeds：资源需求与提供者绑定

需求与提供者在数据里就绑定，不再两处分开维护：

```json
{
  "name": "Token Plan 或额度",
  "qty": "不限",
  "desc": "项目 Code Review CI 与开发提效",
  "provider": "Boy"
}
```

`provider` 填 `tiers.infrastructure` 中某条的 `name`（页面据此解析出 Logo / 头像与链接，用小标识内联显示）；待支持的项填 `null`。改提供者时只动这一处，不会再出现「清单说他提供了、需求却标待支持」那种漏改。

### 条目字段

`strategic` / `supporter` 用通用字段；`infrastructure` 是**需求项**，一条 = 某人在某段时间提供的一项资源，同一个人可以有多条：

```json
{
  "name": "Boy",
  "avatar": "https://avatars.githubusercontent.com/u/40259902?s=160&v=4",
  "url": "https://github.com/yxplus1116",
  "need": "Token Plan 或额度",
  "detail": "ChatGPT 额度",
  "qty": "不限",
  "period": "2026.10 至今",
  "current": true,
  "featured": true
}
```

| 字段 | 必填 | 适用 | 说明 |
|:-----|:--:|:--|:-----|
| `name` | 是 | 全部 | 公司名或个人昵称 |
| `need` | 是 | infrastructure | **需要什么**（需求词汇，主信息），如 `云服务器`、`Token Plan 或额度`、`任务调度中心`；与上方 `resourceNeeds` 的名称口径一致 |
| `detail` | 否 | infrastructure | **实际提供的具体内容**（次级标注），如 `8C16G + 10M`、`ChatGPT 额度`。同类需求里谁给得更多，差异全在这里；只写 need 会抹平它 |
| `qty` | 是 | infrastructure | 数量，如 `×1`、`不限` |
| `period` | 是 | infrastructure | 支持周期文本，如 `2024.10 ~ 2025.8`、`~ 2025.8`、`2025.8 至今`。这是资源的**运转周期**，不是捐赠日期 |
| `current` | 否 | infrastructure | 当前在用的项；当前项排在数组前面 |
| `env` / `spec` | 否 | infrastructure | 仅当前在用的服务器项：承载的服务与配置规格，供 `/demo` 页读取 |
| `logo` | 否 | 企业 | 品牌标识，**本地素材**相对 `public/images/sponsor/partners/` 的路径（如 `aeoliancloud/logo.webp`） |
| `avatar` | 否 | 个人 | **外链**（GitHub / Gitee 平台头像），与 logo 二选一 |
| `url` | 否 | 全部 | 主页；有才该项可点 |
| `status` | 否 | strategic / supporter | `past` = 往期，缺省为在支持 |
| `featured` | 否 | 全部 | **内部策展标记，绝不渲染成标签** |
| `img` | 否 | 企业 | 广告横幅（建议 680×320），相对 partners 目录的路径，用于演示站轮播 |

**资源合作伙伴不分过去 / 现在两组**——所有贡献项都在 `infrastructure` 一个数组里，按顺序排列（当前在用的在前），每条自带 `period`。这样一份名单就是一份完整的贡献台账，而不是把人划成「在的」和「走的」两类。

#### featured：首页策展口径

首页是社会证明位，按「承诺」而不是「金额」选，规则只存在于 `lib/sponsors.ts` 的 `getHomepageBackers()`：

- 开源合作伙伴：在支持的**全部**上首页；
- 资源合作伙伴：当前在用 + `featured: true`（价值过阈值）；
- 个人支持者：优先 `featured`（长期）；一个长期都没有时取最近的几位兜底。

页面不解释这些规则、也不贴「精选」标签——否则首页就退化成排行榜，没上首页的人会觉得自己被评了级。

### 维护约定

- **一律不写金额。** 数额之间没有可比性，写出来读者读到的不是感谢而是排序，对给得少的人尤其不公道。
- **个人支持者不写任何说明。** 名字本身就是全部信息；胶囊里多一句只会把名单往账单推。
- **个人支持者不写捐赠日期。** 日期会让名单变成一张账单，让"什么时候给的"盖过"他给过"。
- **need 写需求词汇，detail 写具体物，都不写长句。** 读者先看到的是「满足了哪项需求」，再看到「具体给了什么」；一句话散文（如「为演示环境提供服务器与带宽支持」）是噪音。`detail` 要保留——8C16G 与 2C2G 的差别就是慷慨的差别，抹平它对给得多的人不公道。
- **资源项顺序手工维护**：当前在用的在前，其余按时间倒序；`period` 是自由文本，代码不排序。新增一项资源时，把上一条的 `period` 补成闭区间，并把 `current` 移交给新项。
- **往期不删除、不降级。** 支持过就是支持过；且「有人支持过一阵」对后来者是真实信号——比「从未有人支持」更敢迈出第一步。个人 / 合作伙伴停止支持时把 `status` 改成 `past`，名字、头像、链接三项待遇完全不变；资源贡献则作为带 `period` 的条目永久留在 `infrastructure` 台账里。
- **别用「一次性」这个词。** 中文里容易读成"用完即弃"，既不体面也让支持的人不舒服。
- `strategic` / `infrastructure` 的 `img` / `logo` 路径在构建期校验存在性，写错会直接让构建失败。`avatar` 用平台头像外链，不进 partners 目录。
- `/demo` 页不再有独立数据源（原 `data/demo-environments.json` 与 `lib/demo-env.ts` 已移除），当前演示环境直接读取 `infrastructure` 中在用的服务器项（`env` / `spec`），支持者与演示环境只有一份事实来源。
