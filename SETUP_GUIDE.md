# 项目初始化和运行指南

## 一、环境准备

### 1.1 安装 Node.js

推荐安装 Node.js 18.x LTS 版本：
- 下载地址：https://nodejs.cn/
- 安装完成后，在终端执行以下命令验证：

```bash
node -v
npm -v
```

### 1.2 安装 HBuilderX（强烈推荐）

HBuilderX 是 uni-app 官方推荐的 IDE，对 uni-app 支持最好：

- 下载地址：https://www.dcloud.io/hbuilderx.html
- 选择「App开发版」下载安装

### 1.3 安装微信开发者工具（如需开发小程序）

- 下载地址：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

## 二、安装依赖

### 2.1 打开项目目录

在终端中进入项目目录：

```bash
cd c:\Users\15820\app_qiang
```

### 2.2 安装 npm 依赖

```bash
npm install
```

如果安装速度慢，可以使用国内镜像源：

```bash
npm install --registry=https://registry.npmmirror.com
```

## 三、配置腾讯云开发

### 3.1 注册腾讯云账号

1. 访问 https://cloud.tencent.com/
2. 注册并登录腾讯云账号

### 3.2 开通云开发

1. 访问云开发控制台：https://console.cloud.tencent.com/tcb
2. 点击「新建环境」
3. 选择「按量付费」或「包年包月」（新手推荐「按量付费」，有免费额度）
4. 输入环境名称，点击「开通」

### 3.3 获取环境 ID

1. 环境创建完成后，在控制台首页可以看到环境 ID
2. 复制环境 ID（类似 `cloud1-xxx` 格式）

### 3.4 配置到项目中

打开文件：`src/utils/tcb.ts`

找到这一行：
```typescript
const TCB_ENV_ID = 'TCB_ENV_ID'
```

替换为：
```typescript
const TCB_ENV_ID = '你的环境ID'
```

例如：
```typescript
const TCB_ENV_ID = 'cloud1-7gxyz123abc456'
```

### 3.5 创建数据库集合

在云开发控制台：
1. 点击左侧「数据库」
2. 点击「添加集合」
3. 创建以下集合：
   - `users` - 用户表
   - `posts` - 帖子表
   - `comments` - 评论表

### 3.6 修改数据库权限

每个集合创建后，需要设置权限规则：

1. 点击集合名称
2. 点击「权限设置」
3. 选择「自定义安全规则」
4. 配置规则（开发阶段可以先设为所有可读可写）：

```json
{
  "read": true,
  "write": true
}
```

> 注意：生产环境请根据业务需求设置更严格的权限规则

## 四、添加 TabBar 图标

底部导航栏需要 8 个图标文件：

1. 在 `src/static/tabbar/` 目录下放入以下图标：
   - `home.png`、`home-active.png`
   - `hot.png`、`hot-active.png`
   - `post.png`、`post-active.png`
   - `mine.png`、`mine-active.png`

2. 图标规格建议：
   - 尺寸：81px × 81px
   - 格式：PNG
   - 风格：简洁线性图标

3. 临时方案：
   - 可以先用纯色方块代替
   - 或者从 iconfont、iconpark 等网站下载

## 五、运行项目

### 方式一：使用 HBuilderX 运行（推荐）

#### 5.1 导入项目到 HBuilderX

1. 打开 HBuilderX
2. 文件 → 打开目录
3. 选择 `c:\Users\15820\app_qiang` 文件夹

#### 5.2 运行到 H5（浏览器）

1. 在 HBuilderX 左侧项目管理器中，选中项目
2. 点击顶部菜单：运行 → 运行到浏览器 → Chrome（或其他浏览器）
3. 浏览器会自动打开 http://localhost:3000

#### 5.3 运行到微信小程序

1. 打开微信开发者工具
2. 在 HBuilderX 中：运行 → 运行到小程序模拟器 → 微信开发者工具
3. 首次运行需要配置微信开发者工具路径
4. 微信开发者工具会自动打开并导入项目

#### 5.4 运行到 App 模拟器

**Android 模拟器：**
1. 下载安装夜神模拟器、MuMu 模拟器等
2. 启动模拟器
3. 在 HBuilderX 中：运行 → 运行到手机或模拟器 → 运行到 Android App 基座

**iOS 模拟器（仅 macOS）：**
1. 安装 Xcode
2. 启动模拟器
3. 在 HBuilderX 中：运行 → 运行到手机或模拟器 → 运行到 iOS App 基座

### 方式二：使用命令行运行

#### 运行到 H5

```bash
npm run dev:h5
```

然后在浏览器打开 http://localhost:3000

#### 运行到微信小程序

```bash
npm run dev:mp-weixin
```

然后打开微信开发者工具，导入项目，选择 `dist/dev/mp-weixin` 目录

## 六、常见问题

### Q1: npm install 失败怎么办？

A: 尝试以下方法：
1. 删除 `node_modules` 文件夹和 `package-lock.json`
2. 清理 npm 缓存：`npm cache clean --force`
3. 使用国内镜像：`npm install --registry=https://registry.npmmirror.com`

### Q2: 腾讯云开发初始化失败？

A: 检查以下几点：
1. 环境 ID 是否正确
2. 云开发环境是否已创建并处于运行状态
3. 网络是否能访问腾讯云服务

### Q3: HBuilderX 运行提示找不到 node？

A: 在 HBuilderX 中配置 node 路径：
1. 工具 → 设置 → 运行配置
2. 配置 Node 路径

### Q4: 微信小程序预览时提示域名不合法？

A: 在微信开发者工具中：
1. 详情 → 本地设置
2. 勾选「不校验合法域名、web-view（业务域名）、TLS版本以及HTTPS证书」

## 七、下一步

项目运行成功后，你可以：

1. 完善登录逻辑，接入短信验证码
2. 实现真实的 API 接口，对接腾讯云数据库
3. 添加更多功能页面
4. 配置 App 打包，生成安装包

祝你开发顺利！
