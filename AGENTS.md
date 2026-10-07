# AGENTS.md

本文件为在本代码库中工作的 AI 编程智能体（DeepSeek Harness、Claude Code、Codex、Cursor 等）提供指引。面向人类贡献者的说明请查阅 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## AI 贡献准则

- **不得以 AI 身份在 Issue 或 PR 上发表评论**。讨论区只属于人类。
- **先讨论再实现**：非平凡改动（如新增大版块、重构布局、调整文档架构）开工前，先在 Issue 中与维护者就实现方向达成一致。
- **文档内容不要写进本仓库**：各项目的文档源在其自身仓库的 `docs/` 目录，本仓库只在构建时汇聚渲染。AI 被指派写某项目文档时，应到**对应项目仓库**的 `docs/` 下工作，而非本仓库的 `content/docs/`（后者是构建期产物）。
- **禁止硬编码敏感信息**：服务器地址、凭据、密钥、token 等一律通过 GitHub Secrets 注入（见 `.github/workflows/deploy.yml`），禁止出现在任何源码、配置或脚本中。本仓库已开源。
- **披露 AI 使用**：当提交中较大部分由 AI 生成时，请在 commit message 末尾追加 trailer，注明实际使用的智能体，例如：

  ```
  Assisted-by: DeepSeek Harness
  ```
- 贡献流程一律**遵循 [CONTRIBUTING.md](./CONTRIBUTING.md)**。

## 项目概述

本仓库是 ContiNew 开源社区的**官网与文档站**，基于 **Next.js 16（静态导出）+ Fumadocs 16 + Tailwind CSS 4** 构建，产物为纯静态文件（`out/`），由 GitHub Actions 推送至自有 Nginx 服务器托管。

**当前版本**：0.1.0 | **主分支**：`main` | **Node**：>= 22 | **包管理**：pnpm >= 10（版本经 `pnpm-workspace.yaml` 的 `catalog:` 统一管理）

## 核心架构

### 两部分内容，两种来源

| 内容 | 位置 | 来源与维护方式 |
|:-----|:-----|:---------------|
| **官网页面** | `app/(home)/page.tsx`（首页）等 | 本仓库原生维护，含 Hero、项目导航、生态、关于等 |
| **文档站** | `content/docs/<project>/` | **构建期从各项目仓库 `docs/` 汇聚而来**（CI 用 `actions/checkout` 拉取），本仓库不编辑文档内容，仅提供分区骨架与渲染框架 |

### 文档分区

`content/docs/` 下按项目分区，URL 与目录一一对应：

| 分区目录 | URL | 文档源仓库 |
|:---------|:----|:-----------|
| `content/docs/starter/` | `/docs/starter/*` | `continew-org/continew-starter` 的 `docs/` |
| `content/docs/admin/` | `/docs/admin/*` | `continew-org/continew-admin` 的 `docs/`（含前端 `continew-admin-ui` 文档） |
| `content/docs/app/` | `/docs/app/*` | `continew-org/continew-app` 的 `docs/` |

每个分区以 `meta.json`（声明分区标题、图标、页面顺序，并标记 `root: true` 构成 Root Folder）+ `index.mdx`（分区入口占位）构成骨架，纳入版本控制；真实文档页为构建期汇聚产物，不提交。

分区即 Fumadocs **Root Folder**：`meta.json` 标记 `root: true` 后，`app/docs/layout.tsx` 以 `tabMode="top"` 在侧边栏顶部渲染项目切换器，且仅显示当前打开的项目分支，其余隐藏。新增项目分区时，在其 `meta.json` 加 `root: true` 并在 `lib/shared.ts` 的 `docSourceRepos` 登记源仓库映射即可。

### 关键文件

| 文件 | 职责 |
|:-----|:-----|
| `lib/source.ts` | Fumadocs 数据源（`defineDocs` 指向 `content/docs`），加载页面树 |
| `lib/shared.ts` | 站点常量（站点名、组织 GitHub、路由前缀）、`docSourceRepos` 分区→源仓库映射、`getEditOnGithubUrl` 编辑链接生成 |
| `lib/layout.shared.tsx` | 布局共享配置（导航、各分区链接） |
| `app/docs/[[...slug]]/page.tsx` | 文档页渲染（MDX、TOC、Markdown 复制、按分区映射源仓库的「在 GitHub 编辑」） |
| `app/api/search/route.ts` | 静态搜索（构建期预生成 Orama 索引，`staticGET`） |
| `components/search-dialog.tsx` | 静态搜索对话框（客户端查询预生成索引） |
| `app/og/docs/[...slug]/route.tsx` | 构建期预渲染各文档页 OG 图片 |
| `app/robots.ts` / `app/sitemap.ts` | SEO：robots.txt 与 sitemap.xml（Metadata Routes） |

### 关键机制

- **静态导出**：`next.config.mjs` 设 `output: 'export'`，产物为纯静态文件；`images.unoptimized: true`。无服务端运行时，故不使用 Next 中间件（`proxy.ts` 已移除）。
- **静态搜索**：无服务端搜索 API，搜索在构建期预生成 Orama 索引（`createFromSource` + `staticGET`），客户端通过 `staticClient()` 加载索引查询。文档量大时索引体积需关注，届时可迁移 Orama Cloud / Algolia。
- **MDX 组件**：`components/mdx.tsx` 的 `getMDXComponents` 汇总 Fumadocs 默认组件，自定义组件在此注册。
- **llms.txt**：`app/llms.txt`、`app/llms-full.txt`、`app/llms.mdx/` 为 LLM 提供纯文本/Markdown 文档，便于 AI 工具检索。

## 构建与运行命令

```bash
pnpm install          # 安装依赖
pnpm dev              # 开发服务器（http://localhost:3000，默认渲染分区占位骨架）
pnpm build            # 静态导出到 out/
pnpm lint             # ESLint
pnpm types:check      # TypeScript 类型检查
```

本地预览真实文档：将对应项目仓库的 `docs/` 复制进分区即可（如 `cp -r ../continew-starter/docs/. content/docs/starter/`），复制内容属构建期汇聚产物，不提交。

### 提交前检查（必须通过）

推送前**必须**让以下检查通过（CI 对每个 PR 执行同样的检查，见 `.github/workflows/ci.yml`）：

1. `pnpm lint` —— ESLint 无报错；
2. `pnpm types:check` —— TypeScript 类型检查通过；
3. `pnpm build` —— 静态导出构建成功。

仅改动文案、文档占位（`content/docs/**/*.mdx` 的占位内容）或非源码文件时，仍建议至少跑 `pnpm build` 确认可正常构建。

## 代码风格

- **TypeScript strict 模式**（`tsconfig.json` `strict: true`），路径别名 `@/*` 指向仓库根；
- React 服务端组件优先，仅交互组件加 `'use client'`；
- 样式一律使用 Tailwind CSS 4 工具类与 Fumadocs 主题变量（`fd-*`，如 `text-fd-muted-foreground`、`border-fd-border`、`bg-fd-primary`），不写内联样式或单独 CSS 文件（全局样式集中在 `app/global.css`）；
- 依赖版本在 `pnpm-workspace.yaml` 的 `catalog:` 统一管理，`package.json` 中以 `"catalog:"` 引用；新增依赖优先考虑是否已有同类依赖；
- fumadocs 相关包（`fumadocs-core` / `fumadocs-ui`）版本号保持一致，`fumadocs-mdx` 为独立发布线，升级时核对其 peer 约束（见 `pnpm-workspace.yaml` 注释）。

> **为何 `fumadocs-ui` 写作 `npm:@fumadocs/base-ui@<version>`**：自 Fumadocs 16 起，官方脚手架（`create-fumadocs-app`）将 UI 运行时拆分为基础包 `@fumadocs/base-ui`，`fumadocs-ui` 作为指向它的 npm 别名安装，二者版本号保持一致。这是官方当前的标准安装方式，并非 hack；升级 fumadocs 时，沿用 `npm:@fumadocs/base-ui@<新版本>` 形式同步 bump 即可，不要改回裸 `fumadocs-ui@<version>`（可能与官方模板的内部导出路径不一致）。

## 文档架构约定（写文档的 AI 必读）

> 以下约定同时适用于各项目仓库 `docs/` 目录的文档写作——本仓库是这些约定的「事实源」，各项目仓库的 AGENTS.md 可引用本节。

### 目录组织原则

- **集中式 `docs/`**：文档统一放项目仓库根的 `docs/` 目录，按「叙事式学习路径」组织（快速开始 → 核心概念 → 按功能/模块深入 → 参考 → FAQ），而非按代码模块平铺；
- **模块 README 做导航卡片**：多模块项目（如 continew-starter）的各模块内保留简版 `README.md`，只放「是什么 + 坐标 + 一句话用法 + 完整文档链接」，不复述完整文档，避免内容重复漂移；
- **AGENTS.md 放根级**：构建命令、代码风格、协作约定放仓库根一份即可，AI 工具均从根读取；仅当某模块有显著不同的构建/测试方式时才在模块级补充。

### frontmatter 约定

每个 `.mdx` 文档必须包含：

```mdx
---
title: 页面标题
description: 一句话描述（用于 SEO、搜索摘要、OG 图片与 llms.txt）
---
```

- `title` 简明，不含项目名前缀（导航已体现分区）；
- `description` 必填，一到两句话，说明本页解决什么问题。

### 写作风格

- 使用简体中文，技术术语保留英文原文（如 Starter、Token、CRUD）；
- 代码块标注语言（```bash、```java、```yaml、```xml），命令给出可直接复制执行的完整形式；
- 配置项、类名、注解使用行内代码（`` ` ``）包裹；
- 善用 Fumadocs 组件：`<Cards>`/`<Card>` 做导航、`<Callout>`（或 `> [!NOTE]`）做提示、`<Tabs>` 做多端/多方式切换、`<Steps>` 做步骤引导；
- 版本相关内容标注适用版本（如「自 2.17.0 起」「4.x 仅」），为后续大版本文档锁定做准备。

## PR 约定

所有 PR 提交到 `main` 分支。请基于 `main` 创建特性分支（如 `feat/home-hero`），不要直接修改 `main`。

**提交格式**：[Conventional Commits（约定式提交）1.0.0](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范，`<类型>[可选作用域]: <描述>`，破坏性变更在类型或作用域后追加 `!`。

**提交前检查**：

```bash
pnpm lint && pnpm types:check && pnpm build
```

## 部署

- 与 continew-admin-ui 同一套模式：**self-hosted runner 与部署机同机**，构建产物经本机 `rsync` 落到 Nginx 站点目录，无跨机 SSH、无密码/密钥；
- 推送到 `main` 或各项目仓库文档更新（`repository_dispatch`，type `docs-updated`）时，`.github/workflows/deploy.yml` 自动静态导出并同步至站点目录；
- 仅需一个 Secret：`SERVER_PATH`（Nginx 站点根目录）。前提是部署机已注册为本仓库的 self-hosted runner（与 admin / admin-ui 共用即可）。

## 安全漏洞

不得通过 GitHub Issue 报告安全漏洞或泄露任何凭据。请使用 GitHub 私有漏洞报告——详见 [SECURITY.md](./SECURITY.md)。

## Agent Skills

各 agent 工具（DeepSeek Harness / Claude Code / Codex）共用的技能统一存放在 `.agents/skills/` 作为唯一事实源——每个技能一个目录、含 `SKILL.md`。新增技能沿用 `ocn-` 命名前缀。文档写作类技能（如 `ocn-doc-writing`）应沉淀本节「文档架构约定」的可执行模板与检查清单。
