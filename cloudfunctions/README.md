# 超详细部署指南

---

## 目录

1. [第一步：创建数据库集合（超详细）](#第一步创建数据库集合超详细)
2. [第二步：部署云函数（超详细）](#第二步部署云函数超详细)
3. [第三步：配置云函数权限（超详细）](#第三步配置云函数权限超详细)
4. [常见问题解答](#常见问题解答)

---

## 第一步：创建数据库集合（超详细）

### 📌 关于 `_id` 字段的说明

**重要：`_id` 字段不需要你手动创建！**

这是云数据库**自动生成**的字段，每条记录插入时系统会自动给它一个唯一的 `_id`。你只需要创建**空集合**就行！

---

### 🎯 创建第一个集合：`users`

1. 打开浏览器，访问：https://console.cloud.tencent.com/tcb
2. 登录你的腾讯云账号
3. 找到你的环境（叫 `campus-4gtohna7154aa61e`），点击进入
4. 左侧菜单找到 **「数据库」**，点击进入
5. 点击 **「新建集合」** 按钮
6. 在弹窗里输入集合名称：`users`
7. 点击 **「确定」**

✅ **完成！** 不用添加任何字段，空集合就可以！

---

### 🎯 继续创建其他集合

按同样的步骤，依次创建以下 **5个空集合**：

| 序号 | 集合名称 | 说明 |
|------|----------|------|
| 1 | `users` | 用户表 |
| 2 | `sms_codes` | 短信验证码表 |
| 3 | `post` | 帖子表 |
| 4 | `post_likes` | 点赞记录表 |
| 5 | `comments` | 评论表 |

**都是空集合！不要手动加字段！**

---

## 第二步：部署云函数（超详细）

### 准备工作

确保你的电脑里有这个项目文件夹，路径是：
```
C:\Users\15820\app_qiang\cloudfunctions\
```

这个文件夹里应该有这些子文件夹：
- `sendSms/`
- `login/`
- `registerUser/`
- `getUserInfo/`
- `deleteAccount/`
- `getSchoolPosts/`
- `likePost/`
- `createPost/`

---

### 🎯 部署第一个云函数：`sendSms`

1. 在腾讯云开发控制台，左侧菜单找到 **「云函数」**，点击进入
2. 点击 **「新建」** 按钮
3. **函数名称** 填：`sendSms`
4. **运行环境** 选：`Node.js`
5. **上传方式** 选：`本地文件夹`
6. 点击 **「选择文件夹」**
7. 在弹出的文件选择框里，找到并选择这个文件夹：
   ```
   C:\Users\15820\app_qiang\cloudfunctions\sendSms
   ```
8. 点击 **「确定」**（或者叫「保存」）
9. 等待上传完成（约10-30秒）

✅ 第一个云函数部署完成！

---

### 🎯 继续部署其他云函数

按同样的步骤，依次部署以下 **8个云函数**：

| 序号 | 函数名 | 选择的文件夹 |
|------|--------|--------------|
| 1 | `sendSms` | `cloudfunctions/sendSms` |
| 2 | `login` | `cloudfunctions/login` |
| 3 | `registerUser` | `cloudfunctions/registerUser` |
| 4 | `getUserInfo` | `cloudfunctions/getUserInfo` |
| 5 | `deleteAccount` | `cloudfunctions/deleteAccount` |
| 6 | `getSchoolPosts` | `cloudfunctions/getSchoolPosts` |
| 7 | `likePost` | `cloudfunctions/likePost` |
| 8 | `createPost` | `cloudfunctions/createPost` |

---

## 第三步：配置云函数权限（超详细）

**这是你问的重点！** 有些云函数需要特殊权限才能工作。

---

### 🎯 给 `sendSms` 加权限

1. 在「云函数」列表里，找到 `sendSms`
2. 点击 `sendSms` 这个函数名（进入详情页）
3. 在详情页的顶部或侧边，找到 **「权限配置」**（或者叫「权限管理」）标签，点击进入
4. 点击 **「编辑权限」** 按钮
5. 在权限列表里，找到并勾选：
   - `tcb.sendSms`（发送短信）
6. 点击 **「确定」** 保存

✅ `sendSms` 权限配置完成！

---

### 🎯 给 `createPost` 加权限

1. 回到「云函数」列表
2. 找到 `createPost`，点击函数名进入详情
3. 找到 **「权限配置」** 标签，点击进入
4. 点击 **「编辑权限」**
5. 找到并勾选这两个权限：
   - `security.msgSecCheck`（文本内容安全审核）
   - `security.imgSecCheck`（图片内容安全审核）
6. 点击 **「确定」** 保存

✅ `createPost` 权限配置完成！

---

### 其他云函数

- `login`、`registerUser`、`getUserInfo`、`deleteAccount`、`getSchoolPosts`、`likePost`
- **这些不需要额外权限配置**，保持默认即可

---

## 常见问题解答

### Q1: 我能手动创建 `_id` 字段吗？

**A: 不能，也不需要！** `_id` 是系统自动生成的，你手动创建会报错。

---

### Q2: 数据库集合里要不要先加一些字段？

**A: 不用！** 云函数运行时会自动往集合里插入数据，字段会自动创建。

---

### Q3: 部署云函数时报错怎么办？

**A:**
1. 检查文件夹路径对不对
2. 确认文件夹里有 `index.js`、`package.json`、`config.json` 这三个文件
3. 网络不好就重试一次

---

### Q4: 配置权限时找不到权限选项？

**A:**
1. 确认找的是「权限配置」不是「环境配置」
2. 如果真的找不到，可能是环境没有开通相关服务，先不管它，不影响基础功能测试

---

## 快速检查清单

部署完成后，检查一下：

- [ ] 数据库有5个空集合：`users`、`sms_codes`、`post`、`post_likes`、`comments`
- [ ] 云函数列表里有8个函数
- [ ] `sendSms` 的权限里有 `tcb.sendSms`
- [ ] `createPost` 的权限里有 `security.msgSecCheck` 和 `security.imgSecCheck`

✅ **全部完成后，就可以在 HBuilderX 里测试了！**
