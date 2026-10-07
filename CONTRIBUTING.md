# 贡献指南

> 本指南适用于 ContiNew 官网与文档站（continew.top）仓库。各项目仓库（如 Continew Starter / Admin）的贡献请见其各自的 CONTRIBUTING.md。

感谢您对 ContiNew 开源项目的关注！无论是改进官网页面、优化文档站框架，还是修正一处样式，每一份贡献都很有价值。

## 行为准则

参与本项目即表示您同意遵守我们的[行为准则](CODE_OF_CONDUCT.md)。请在所有交流中保持友善和建设性。

## 我能贡献什么

| 方式 | 说明 |
|:-----|:-----|
| 改进官网 | 优化首页、生态页、关于页等官网页面（`app/` 目录） |
| 优化文档站框架 | 改进布局、导航、搜索、主题、组件等（`app/`、`components/`、`lib/`） |
| 报告问题 | 官网样式异常、构建失败、链接失效等，通过 Issue 反馈 |
| 改进工程化 | 优化 CI/CD、构建脚本、文档同步机制 |

> **想修改某个项目的文档内容？** 请到对应项目仓库的 `docs/` 目录提 PR，而不是本仓库。官网文档源分散在各项目仓库中，见 [README](README.md#文档从哪里来重要)。

如果是比较复杂的修改（如新增大版块、重构布局），建议先提交 Issue 讨论方案，达成基本共识后再动手。

## 环境准备

| 要求 | 说明 |
|:-----|:-----|
| Node.js | >= 22 |
| pnpm | >= 10（推荐 `npm install -g pnpm@latest`） |

```bash
git clone https://github.com/<您的用户名>/continew.top.git
cd continew.top
pnpm install
pnpm dev          # http://localhost:3000
```

如需预览真实文档（而非占位分区），将对应项目仓库克隆到本地，把它的 `docs/` 复制进相应分区即可，例如 `cp -r ../continew-starter/docs/. content/docs/starter/`，再启动。

## 贡献流程

1. **Fork 并克隆**本仓库；
2. **创建特性分支**，建议前缀标明类型：`feat/`（新功能）、`fix/`（修复）、`docs/`（文档/文案）、`refactor/`（重构）、`style/`（样式）、`ci/`（CI/构建）、`chore/`（杂项）；
3. **开发并自测**；
4. **提交 Commit**，遵循 [Conventional Commits（约定式提交）1.0.0](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范；
5. **推送并创建 PR**，目标分支为 `main`，按 PR 模板填写说明。

## 提交前检查（必须通过）

推送前请在本地执行，确保全部通过：

```bash
pnpm lint          # ESLint
pnpm types:check   # TypeScript 类型检查
pnpm build         # 静态导出构建（验证可正常构建）
```

CI 会对每个 PR 执行同样的检查（见 [.github/workflows/ci.yml](.github/workflows/ci.yml)），未通过的 PR 不会被审查。

## PR 检查清单

- [ ] 一个 PR 只做一件事，不夹带无关改动
- [ ] `pnpm lint`、`pnpm types:check`、`pnpm build` 全部通过
- [ ] 改动官网页面时已自检桌面端与移动端显示效果
- [ ] 涉及文档架构/目录约定变更时，已同步更新 [AGENTS.md](AGENTS.md)
- [ ] commit message 符合 Conventional Commits 规范
- [ ] 未引入任何敏感信息（凭据、内网地址等）

## 安全

请勿在仓库或 Issue 中提交任何凭据、密钥、内网地址等敏感信息。服务器凭据一律通过 GitHub Secrets 管理。如发现安全问题，请通过 GitHub 私有安全通告负责任地披露，而非公开 Issue。

## 许可

向本仓库贡献即表示您同意您的贡献以 [Apache-2.0](LICENSE) 许可证进行许可。
