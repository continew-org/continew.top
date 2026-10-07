---
name: ocn-doc-writing
description: 按 ContiNew 文档架构与写作规范撰写/重写开源项目文档（.mdx）。当 AI 被指派编写、重写或评审 continew 各项目仓库 docs/ 下的文档时使用，确保目录组织、frontmatter、组件用法与风格一致。
---

# ContiNew 文档写作技能

本技能沉淀 ContiNew 开源社区文档的可执行写作规范与模板，供 AI 智能体撰写或重写各项目仓库 `docs/` 目录文档时遵循。规范的「事实源」见 [continew.top 仓库 AGENTS.md](../../../AGENTS.md) 的「文档架构约定」一节。

## 何时使用

- 在某项目仓库（continew-starter / continew-admin / continew-app）的 `docs/` 下新建或重写文档；
- 评审文档是否符合社区规范；
- 将旧站（VitePress）文档迁移为 Fumadocs 格式。

## 目录组织

按「叙事式学习路径」组织，而非按代码模块平铺：

```
docs/
├── index.mdx              # 分区入口：是什么 + 核心价值 + 导航卡片
├── meta.json              # 分区标题、图标、页面顺序
├── guide/                 # 指南：快速开始、安装、核心概念
│   ├── getting-started.mdx
│   └── ...
├── <功能或模块分区>/       # 按功能/模块深入（每区一个目录 + index + 子页）
├── reference/             # 参考：配置项、API、FAQ
└── changelog.mdx          # 版本变更（或链接到项目 CHANGELOG）
```

原则：

- 用户的阅读路径是「快速开始 → 引入依赖 → 查某功能完整用法」，组织方式要服务于这条路径；
- 一个功能的完整文档集中一处，即使它横跨多个代码模块；
- 多模块项目的模块内只放简版 `README.md`（是什么 + 坐标 + 一句话用法 + 完整文档链接），不复述完整文档。

## frontmatter（必填）

```mdx
---
title: 页面标题
description: 一句话描述本页解决什么问题（用于 SEO、搜索摘要、OG 图片、llms.txt）
---
```

## 写作检查清单

写完对照自检：

- [ ] frontmatter 含 `title` 与 `description`，`description` 非空且说明价值
- [ ] 简体中文，技术术语保留英文原文
- [ ] 代码块标注语言，命令可直接复制执行
- [ ] 配置项/类名/注解用行内代码包裹
- [ ] 需要处使用 Fumadocs 组件（Cards / Callout / Tabs / Steps）
- [ ] 标注适用版本（如「自 2.17.0 起」），为大版本锁定做准备
- [ ] 链接使用相对路径，指向同分区其他页时可用 `/docs/<project>/...`

## 常用 Fumadocs 组件速查

```mdx
<Cards>
  <Card title="标题" href="/docs/starter/guide/getting-started" />
</Cards>

<Callout type="info|warn|error">提示内容</Callout>

<Tabs items={['Maven', 'Gradle']}>
  <Tab value="Maven">...</Tab>
  <Tab value="Gradle">...</Tab>
</Tabs>

<Steps>
  <Step>第一步</Step>
  <Step>第二步</Step>
</Steps>
```
