# 云函数部署说明

## 云函数列表

| 函数名 | 说明 | 权限要求 |
|--------|------|----------|
| getSchoolPosts | 获取本校帖子（按 school_id 过滤） | - |
| likePost | 点赞/取消点赞帖子 | - |
| createPost | 发布帖子（含内容安全审核） | security.msgSecCheck, security.imgSecCheck |

## 部署步骤

### 1. 登录腾讯云开发控制台

访问 https://console.cloud.tencent.com/tcb

### 2. 选择环境

选择你的云开发环境（如 `campus-4gtohna7154aa61e`）

### 3. 创建云函数

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

### 4. 数据库集合

确保以下数据库集合已创建：

| 集合名 | 说明 | 索引建议 |
|--------|------|----------|
| users | 用户表 | _id |
| post | 帖子表 | school_id, create_time, user_id |
| post_likes | 点赞记录表 | user_id, post_id, (user_id+post_id) 联合唯一 |
| comments | 评论表 | post_id, create_time |

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

#### users 表字段

```javascript
{
  _id: string,
  phone: string,
  nickname: string,
  avatar: string,
  gender: number,
  school: string,
  school_id: string,
  major: string,
  grade: string,
  member_expire_time: Date,  // 会员到期时间
  createTime: Date,
  updateTime: Date
}
```

## 本地开发调试

如果使用微信开发者工具，可以直接右键云函数文件夹选择「上传并部署：云端安装依赖」。
