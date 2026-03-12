# 校园分享 App

面向国内大学生的校园分享平台，基于 uni-app (Vue3 + TypeScript) + 腾讯云开发 (TCB) 构建。

## 技术栈

- **框架**: uni-app 3.x (Vue 3 + TypeScript)
- **UI组件库**: uView Plus
- **状态管理**: Pinia
- **后端服务**: 腾讯云开发 (TCB)
- **构建工具**: Vite

## 项目结构

```
app_qiang/
├── src/
│   ├── api/              # API 接口
│   │   └── index.ts
│   ├── pages/            # 页面
│   │   ├── login/        # 登录页
│   │   ├── index/        # 首页（本校）
│   │   ├── hot/          # 热榜页
│   │   ├── post/         # 发帖页
│   │   └── mine/         # 我的页
│   ├── static/           # 静态资源
│   │   └── tabbar/       # 底部导航图标
│   ├── store/            # Pinia 状态管理
│   │   └── user.ts
│   ├── utils/            # 工具函数
│   │   └── tcb.ts        # 腾讯云开发配置
│   ├── App.vue           # 应用入口组件
│   ├── main.ts           # 应用入口文件
│   ├── manifest.json     # 应用配置
│   └── pages.json        # 页面路由配置
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js (v16 或更高版本)
- HBuilderX (推荐) 或 VS Code
- 微信开发者工具（如需预览小程序）

### 2. 安装依赖

```bash
cd app_qiang
npm install
```

### 3. 配置腾讯云开发

打开 `src/utils/tcb.ts`，将 `TCB_ENV_ID` 替换为你的腾讯云开发环境ID：

```typescript
const TCB_ENV_ID = 'your-env-id-here'  // 替换为你的环境ID
```

#### 如何获取腾讯云开发环境ID：

1. 访问 [腾讯云开发控制台](https://console.cloud.tencent.com/tcb)
2. 开通云开发服务（免费版即可）
3. 创建环境，复制环境ID

### 4. 添加 TabBar 图标

在 `src/static/tabbar/` 目录下添加底部导航栏图标，详见该目录下的 README.md。

### 5. 运行项目

#### 方式一：使用 HBuilderX（推荐）

1. 打开 HBuilderX
2. 文件 → 打开目录 → 选择 `app_qiang` 文件夹
3. 运行 → 运行到手机或模拟器 → 选择运行平台

#### 方式二：使用命令行

```bash
# 运行到 H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到 App
npm run dev:app
```

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录页 | `pages/login/index` | 手机号验证码登录 |
| 首页 | `pages/index/index` | 本校内容流 |
| 热榜页 | `pages/hot/index` | 实时/今日/本周热榜 |
| 发帖页 | `pages/post/index` | 发布新帖子 |
| 我的页 | `pages/mine/index` | 个人中心 |

## 腾讯云开发配置

### 数据库集合建议

```javascript
// 用户表
users: {
  _id: String,
  phone: String,
  nickname: String,
  avatar: String,
  school: String,
  major: String,
  grade: String,
  createTime: Date,
  updateTime: Date
}

// 帖子表
posts: {
  _id: String,
  userId: String,
  school: String,
  category: String,
  title: String,
  content: String,
  images: Array,
  isAnonymous: Boolean,
  viewCount: Number,
  likeCount: Number,
  commentCount: Number,
  createTime: Date,
  updateTime: Date
}

// 评论表
comments: {
  _id: String,
  postId: String,
  userId: String,
  content: String,
  createTime: Date
}
```

## 开发规范

- 使用 TypeScript 编写代码
- 组件命名使用 PascalCase
- 页面文件使用 kebab-case
- 提交代码前执行 `npm run type-check` 检查类型

## 后续开发建议

1. **完善登录逻辑**: 接入腾讯云短信验证码服务
2. **图片上传**: 接入腾讯云存储
3. **实时消息**: 使用 WebSocket 或云开发实时数据推送
4. **内容审核**: 接入腾讯云内容安全服务
5. **App 打包**: 使用 HBuilderX 云打包或离线打包

## 注意事项

- 本项目仅使用国内服务，无任何海外依赖
- 请遵守腾讯云开发服务条款
- 内容安全是校园社区的重中之重，建议加强内容审核机制

## License

MIT
