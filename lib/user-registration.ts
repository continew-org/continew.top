export const registeredEntityLabels = {
  company: '公司',
  team: '团队',
  studio: '工作室',
  school: '学校',
  government: '政府或事业单位',
  nonprofit: '非营利组织',
  'open-source-project': '开源项目',
  individual: '个人',
  other: '其他',
} as const;

export type RegisteredEntityType = keyof typeof registeredEntityLabels;

export const continewProjectLabels = {
  'continew-admin': 'ContiNew Admin',
  'continew-admin-ui': 'ContiNew Admin UI',
  'continew-starter': 'ContiNew Starter',
  'continew-app': 'ContiNew App',
  other: '其他',
} as const;

export type ContinewProjectId = keyof typeof continewProjectLabels;

export type RegistrationSourcePlatform = 'github' | 'gitee' | 'atomgit' | 'other';

export const registrationTemplate = `**展示名称：**（必填）

**主体类型：**（必填；公司 / 团队 / 工作室 / 学校 / 政府或事业单位 / 非营利组织 / 开源项目 / 个人 / 其他）

**使用的 ContiNew 项目：**（必填，可多选；ContiNew Admin / ContiNew Admin UI / ContiNew Starter / ContiNew App / 其他）

**使用场景：**（建议填写；请用一两句话说明用于什么场景）

**所在地区：**（选填；如“浙江 · 杭州”，请勿填写详细地址）

**官网或项目主页：**（选填）

**演示地址：**（选填；请勿包含测试账号、密码或其他敏感信息）

**Logo：**（选填；上传图片或提供可公开访问的图片链接）

**公开展示确认：** 我确认以上信息可在 ContiNew 官方网站公开展示。`;
