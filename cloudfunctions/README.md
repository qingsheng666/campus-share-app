# 云函数部署说明

## 云函数列表

| 函数名 | 说明 | 权限要求 |
|--------|------|----------|
| **sendSms** | 发送短信验证码 | tcb.sendSms |
| **login** | 验证码登录 | - |
| **registerUser** | 注册/更新用户信息 | - |
| **getUserInfo** | 获取用户信息 | - |
| **deleteAccount** | 注销账号（删除所有数据） | - |
| getSchoolPosts | 获取本校帖子（按 school_id 过滤） | - |
| likePost | 点赞/取消点赞帖子 | - |
| createPost | 发布帖子（含内容安全审核） | security.msgSecCheck, security.imgSecCheck |

---

## 部署步骤

### 1. 登录腾讯云开发控制台

访问 https://console.cloud.tencent.com/tcb

### 2. 选择环境

选择你的云开发环境（如 `campus-4gtohna7154aa61e`）

### 3. 创建云函数

#### sendSms（发送短信验证码）

1. 进入「云函数」→「新建」
2. 函数名称：`sendSms`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/sendSms` 文件夹
6. 点击「确定」
7. 进入函数详情 →「权限配置」→ 编辑权限，添加 `tcb.sendSms`

#### login（验证码登录）

1. 进入「云函数」→「新建」
2. 函数名称：`login`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/login` 文件夹
6. 点击「确定」

#### registerUser（注册/更新用户信息）

1. 进入「云函数」→「新建」
2. 函数名称：`registerUser`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/registerUser` 文件夹
6. 点击「确定」

#### getUserInfo（获取用户信息）

1. 进入「云函数」→「新建」
2. 函数名称：`getUserInfo`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/getUserInfo` 文件夹
6. 点击「确定」

#### deleteAccount（注销账号）

1. 进入「云函数」→「新建」
2. 函数名称：`deleteAccount`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/deleteAccount` 文件夹
6. 点击「确定」

#### getSchoolPosts

1. 进入「云函数」→「新建」
2. 函数名称：`getSchoolPosts`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/getSchoolPosts` 文件夹
6. 点击「确定」

#### likePost

1. 进入「云函数」→「新建」
2. 函数名称：`likePost`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/likePost` 文件夹
6. 点击「确定」

#### createPost

1. 进入「云函数」→「新建」
2. 函数名称：`createPost`
3. 运行环境：Node.js
4. 上传方式：本地文件夹
5. 选择 `cloudfunctions/createPost` 文件夹
6. 点击「确定」
7. 进入函数详情 →「权限配置」
8. 点击「编辑权限」
9. 添加权限：
   - `security.msgSecCheck`（文本内容安全）
   - `security.imgSecCheck`（图片内容安全）

---

### 4. 数据库集合

确保以下数据库集合已创建：

| 集合名 | 说明 | 索引建议 |
|--------|------|----------|
| **users** | 用户表 | _id, _openid |
| **sms_codes** | 短信验证码表 | phone, expire_time |
| post | 帖子表 | school_id, create_time, user_id |
| post_likes | 点赞记录表 | user_id, post_id, (user_id+post_id) 联合唯一 |
| comments | 评论表 | post_id, create_time |

#### users 表字段

```javascript
{
  _id: string,
  _openid: string,          // 微信openid或自定义标识
  phone: string,            // 手机号（建议用云数据库字段加密）
  nickname: string,
  avatar: string,
  school_name: string,
  school_id: string,
  grade: string,
  hobbies: string[],        // 兴趣爱好数组
  member_expire_time: Date, // 会员到期时间
  createTime: Date,
  updateTime: Date
}
```

**重要**：`phone` 字段建议在腾讯云控制台配置「字段加密」，保护用户隐私。

#### sms_codes 表字段

```javascript
{
  _id: string,
  phone: string,
  code: string,
  create_time: Date,
  expire_time: Date,
  used: boolean,
  use_time?: Date
}
```

#### post 表字段

```javascript
{
  _id: string,
  user_id: string,        // 发布者ID
  school_id: string,      // 学校ID（用于过滤）
  content: string,        // 文字内容
  images: string[],       // 图片URL数组
  like_count: number,     // 点赞数
  comment_count: number,  // 评论数
  create_time: Date,
  update_time: Date,
  status: number          // 0=审核通过, 1=违规下架
}
```

#### post_likes 表字段

```javascript
{
  _id: string,
  user_id: string,
  post_id: string,
  create_time: Date
}
```

---

## 字段加密配置（手机号隐私保护）

为符合《个人信息保护法》要求，建议对 users 表的 phone 字段启用加密：

1. 进入腾讯云开发控制台 → 数据库
2. 选择 `users` 集合
3. 点击「设置」→「字段加密」
4. 添加 `phone` 字段，选择加密类型

---

## 本地开发调试

如果使用微信开发者工具，可以直接右键云函数文件夹选择「上传并部署：云端安装依赖」。
