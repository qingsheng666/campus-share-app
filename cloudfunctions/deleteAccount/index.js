// 云函数：注销账号（删除所有用户相关数据）
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { user_id, openid, confirm } = event

  if (!confirm) {
    return {
      code: -1,
      message: '请确认注销操作'
    }
  }

  try {
    let query = {}
    if (user_id) {
      query._id = user_id
    } else if (openid) {
      query._openid = openid
    } else {
      const wxContext = cloud.getWXContext()
      if (wxContext.OPENID) {
        query._openid = wxContext.OPENID
      } else {
        return {
          code: -2,
          message: '缺少用户标识'
        }
      }
    }

    // 1. 获取用户信息
    const userRes = await db.collection('users').where(query).get()
    if (userRes.data.length === 0) {
      return {
        code: -3,
        message: '用户不存在'
      }
    }

    const user = userRes.data[0]
    const userId = user._id

    // 使用事务批量删除（云开发免费版暂不支持事务，分步删除）
    const deleteResults = {
      posts: 0,
      comments: 0,
      likes: 0,
      user: false
    }

    // 2. 删除该用户的帖子
    try {
      const postsRes = await db.collection('post')
        .where({
          user_id: userId
        })
        .get()

      for (const post of postsRes.data) {
        // 删除帖子的评论
        await db.collection('comments')
          .where({
            post_id: post._id
          })
          .remove()
        deleteResults.comments += 1

        // 删除帖子
        await db.collection('post').doc(post._id).remove()
        deleteResults.posts += 1
      }
    } catch (e) {
      console.error('删除帖子失败:', e)
    }

    // 3. 删除该用户的点赞记录
    try {
      const likesRes = await db.collection('post_likes')
        .where({
          user_id: userId
        })
        .get()

      for (const like of likesRes.data) {
        // 同时更新帖子点赞数
        try {
          await db.collection('post').doc(like.post_id).update({
            like_count: _.inc(-1)
          })
        } catch (e) {}

        await db.collection('post_likes').doc(like._id).remove()
        deleteResults.likes += 1
      }
    } catch (e) {
      console.error('删除点赞失败:', e)
    }

    // 4. 删除该用户的评论
    try {
      const commentsRes = await db.collection('comments')
        .where({
          user_id: userId
        })
        .get()

      for (const comment of commentsRes.data) {
        // 同时更新帖子评论数
        try {
          await db.collection('post').doc(comment.post_id).update({
            comment_count: _.inc(-1)
          })
        } catch (e) {}

        await db.collection('comments').doc(comment._id).remove()
        deleteResults.comments += 1
      }
    } catch (e) {
      console.error('删除评论失败:', e)
    }

    // 5. 最后删除用户记录
    try {
      await db.collection('users').doc(userId).remove()
      deleteResults.user = true
    } catch (e) {
      console.error('删除用户失败:', e)
    }

    return {
      code: 0,
      message: '注销成功',
      data: deleteResults
    }
  } catch (err) {
    console.error('注销账号失败:', err)
    return {
      code: -4,
      message: err.message || '注销失败'
    }
  }
}
