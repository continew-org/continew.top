# ContiNew 官网与文档站

<p>
  <a href="https://continew.top">官网</a> ·
  <a href="https://continew.top/docs">文档</a> ·
  <a href="https://github.com/continew-org">GitHub 组织</a>
</p>

本仓库是 [ContiNew](https://continew.top) 开源社区的**官网与文档站**源码，基于 [Next.js](https://nextjs.org) + [Fumadocs](https://fumadocs.dev) 构建，静态导出后托管于自有服务器。

## 这是什么

ContiNew（Continue New）是一套以「约定优于配置」为核心的开源生态，包含：

| 项目 | 说明 | 文档分区 |
|:-----|:-----|:---------|
| [ContiNew Starter](https://github.com/continew-org/continew-starter) | Spring Boot 3.x 企业级 Starter 库 | `/docs/starter` |
| [ContiNew Admin](https://github.com/continew-org/continew-admin) | 多租户中后台管理系统框架（含[前端](https://github.com/continew-org/continew-admin-ui)） | `/docs/admin/5.x`（4.x 归档在 `/docs/admin/4.x`） |
| [ContiNew App](https://github.com/continew-org/continew-app) | 移动端应用解决方案 | `/docs/app` |

## 文档从哪里来（重要）

**官网文档的「唯一权威源」是各项目仓库的 `docs/` 目录，而非本仓库。**

- 修改某项目的文档 → 到对应项目仓库的 `docs/` 下提 PR；
- 本仓库只在**构建时**把各项目 `docs/` 汇聚到 `content/docs/<project>/`（Admin 按版本汇聚到 `admin/5.x/` 和 `admin/4.x/`）再渲染，汇聚产物不提交，因此不存在「维护两处」；
- 本仓库自身维护的是**官网页面**（首页、生态、关于等，在 `app/`）与**文档站框架**。

```
continew-starter@dev/docs     ─┐
continew-admin@dev/docs       ─┼─ 构建时按分区/版本汇聚
continew-admin@4.2.x/docs     ─┤
continew-app@dev/docs         ─┘
        ↓
continew.top  (Next.js + Fumadocs)  →  静态导出 out/  →  Nginx
```

详见 [AGENTS.md](AGENTS.md) 的文档架构与协作约定。

## 本地开发

```bash
# 环境要求：Node.js >= 22.18，pnpm >= 10
pnpm install

# 启动开发服务器（默认渲染分区占位骨架）
pnpm dev          # http://localhost:3000
```

如需在本地预览**真实文档**（而非占位分区）：将对应项目仓库克隆到与本仓库同级目录，把它的 `docs/` 复制进相应分区即可，例如：

```bash
# 以 continew-starter 为例（假设已克隆到 ../continew-starter）
cp -r ../continew-starter/docs/. content/docs/starter/
pnpm dev
```

Admin 的两个版本需分别从 `dev` 和 `4.2.x` 的 `docs/` 复制到 `content/docs/admin/5.x/`、`content/docs/admin/4.x/`。版本通过 Fumadocs 侧边栏下拉切换，不设额外版本选择页；旧 `/docs/admin` 保留为指向 4.x 的兼容跳转。版本目录的内容仅供构建使用，不提交。预览完无需清理——汇聚内容已忽略，不影响提交。

其他命令：

```bash
pnpm build        # 静态导出到 out/
pnpm lint         # ESLint
pnpm types:check  # TypeScript 类型检查
```

## 部署

采用 **GitHub Actions** 自动部署（见 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)），与 continew-admin-ui 同一套模式——**self-hosted runner 与部署机同机**，构建产物经本机 `rsync` 落到 Nginx 站点目录，无跨机 SSH、无密码/密钥：

- 推送到 `main`、或各项目仓库文档更新触发 `repository_dispatch` 时，自动静态导出并同步至站点目录；
- 仅需配置一个 Secret：`SERVER_PATH`（Nginx 站点根目录，如 `/root/continew/nginx/html`）。

> 前提：部署机已注册为本仓库的 self-hosted runner（与 admin / admin-ui 共用同一台即可）。

## 贡献

欢迎贡献！无论是改进官网页面、优化文档站框架，还是反馈文档问题。请先阅读：

- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [AGENTS.md](AGENTS.md)（AI 智能体与文档协作约定）

## 许可

本仓库采用**双重许可**，详见 [LICENSE-CONTENT](LICENSE-CONTENT)：

| 内容 | 许可 |
|:-----|:-----|
| 源代码（`app/`、`components/`、`lib/` 等） | [Apache-2.0](LICENSE) |
| 原创内容（官方博客、官网文案与视觉设计、`public/` 原创图片、`data/` 原创数据等） | [CC BY-NC-SA 4.0](LICENSE-CONTENT) |
| 文档内容（`content/docs/`，构建时从各项目仓库汇聚） | 遵循各项目仓库自身许可证 |

第三方素材（字体、图标、开源组件等）遵循其各自的许可证。
