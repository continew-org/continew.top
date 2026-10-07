import Link from 'next/link';
import Image from 'next/image';
import { appDescription, appName, gitConfig } from '@/lib/shared';

const projects = [
  {
    name: 'ContiNew Admin',
    tag: '全栈',
    description:
      '页面现代美观、专注设计与代码细节的高质量多租户中后台管理系统框架。开箱即用，前后端分离，内置代码生成器。',
    href: '/docs/admin',
    repo: 'continew-admin',
  },
  {
    name: 'ContiNew Starter',
    tag: '后端',
    description:
      '基于「约定优于配置」的企业级 Starter 库。封装一系列经过企业实践验证的依赖包（MyBatis-Plus、Sa-Token 等），帮助快速集成常用能力到 Spring Boot Web 应用。',
    href: '/docs/starter',
    repo: 'continew-starter',
  },
  {
    name: 'ContiNew App',
    tag: '多端',
    description:
      '面向 Vibe Coding 的多端工程脚手架（App / 微信小程序 / H5 / 桌面端）。一套代码多端运行，内置工程治理与 AI 协作规范。',
    href: '/docs/app',
    repo: 'continew-app',
  },
];

const beliefs = [
  {
    title: '反复打磨',
    description:
      '我们始终坚信好的产品必然是反复打磨出来的。通过开源社区的力量，打磨出一个好的产品、一个好的实践、一个好的生态。',
  },
  {
    title: '开箱即用',
    description:
      '以「约定优于配置」精简常规配置，提供完整的解决方案，让你快速集成、专注业务，而非重复搭建脚手架。',
  },
  {
    title: '舒适体验',
    description:
      '除了效率的提升，更追求舒适的开发体验，让更多开发者的编程工作多一点「甜」。',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-24 text-center">
        <Image src="/logo.svg" alt={appName} width={72} height={72} priority />
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          Conti<span className="text-fd-primary">New</span>
        </h1>
        <p className="mt-4 text-lg font-medium text-fd-muted-foreground">
          Continue New · 持续迭代，持续焕新
        </p>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-fd-muted-foreground">
          {appDescription}
        </p>
        <p className="mt-4 text-sm italic text-fd-muted-foreground/80">
          It is far from perfect right now, but will improve rapidly.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/docs/admin"
            className="rounded-lg bg-fd-primary px-6 py-3 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            浏览文档
          </Link>
          <Link
            href={`https://github.com/${gitConfig.user}`}
            className="rounded-lg border border-fd-border px-6 py-3 font-medium transition-colors hover:bg-fd-accent"
          >
            GitHub 组织
          </Link>
        </div>
      </section>

      {/* 我们的信念 */}
      <section className="border-t border-fd-border bg-fd-muted/30">
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <h2 className="text-center text-2xl font-semibold">我们的信念</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {beliefs.map((b) => (
              <div key={b.title} className="text-center">
                <h3 className="text-lg font-semibold text-fd-primary">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fd-muted-foreground">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 官方生态 */}
      <section className="mx-auto w-full max-w-5xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">官方生态</h2>
          <p className="mt-3 text-sm text-fd-muted-foreground">
            覆盖后端、前端与多端，一套方法论贯穿始终
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.name}
              href={project.href}
              className="group flex flex-col rounded-xl border border-fd-border p-6 transition-colors hover:border-fd-primary hover:bg-fd-accent"
            >
              <span className="text-xs font-medium text-fd-primary">{project.tag}</span>
              <h3 className="mt-2 text-lg font-semibold group-hover:text-fd-primary">
                {project.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-fd-muted-foreground">
                {project.description}
              </p>
              <span className="mt-4 text-xs text-fd-muted-foreground">
                continew-org/{project.repo} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 参与贡献 */}
      <section className="border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-semibold">参与贡献</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-fd-muted-foreground">
            如果你有好的想法，或者愿意参与进来，不妨从代码评审开始——哪怕是一个缩进的格式错误，
            都可以让 ContiNew 系列项目打磨得更「甜」。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={`https://github.com/${gitConfig.user}`}
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              浏览全部项目
            </Link>
            <Link
              href={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/CONTRIBUTING.md`}
              className="rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              贡献指南
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
