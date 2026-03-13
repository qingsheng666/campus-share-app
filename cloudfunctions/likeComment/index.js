// 点赞评论云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { comment_id, action = 'toggle', user_id } = event
  const { OPENID } = cloud.getWXContext()

  const userId = user_id || OPENID

  if (!comment_id) {
    return {
      code: 400,
      message: '缺少评论ID'
    }
  }

  if (!userId) {
    return {
      code: 401,
      message: '请先登录'
    }
  }

  try {
    // 查询当前点赞状态
    const likeRes = await db.collection('comment_likes')
      .where({
        user_id: userId,
        comment_id: comment_id
      })
      .get()

    const hasLiked = likeRes.data && likeRes.data.length > 0
    let isLiked = hasLiked

    if (action === 'like' && !hasLiked) {
      // 点赞
      await db.collection('comment_likes').add({
        data: {
          user_id: userId,
          comment_id: comment_id,
          create_time: new Date()
        }
      })
      await db.collection('comment').doc(comment_id).update({
        data: {
          like_count: _.inc(1)
        }
      })
      isLiked = true
    } else if (action === 'unlike' && hasLiked) {
      // 取消点赞
      await db.collection('comment_likes')
        .where({
          user_id: userId,
          comment_id: comment_id
        })
        .remove()
      await db.collection('comment').doc(comment_id).update({
        data: {
          like_count: _.inc(-1)
        }
      })
      isLiked = false
    } else if (action === 'toggle') {
      // 切换
      if (hasLiked) {
        // 取消点赞
        await db.collection('comment_likes')
          .where({
            user_id: userId,
            comment_id: comment_id
          })
          .remove()
        await db.collection('comment').doc(comment_id).update({
          data: {
            like_count: _.inc(-1)
          }
        })
        isLiked = false
      } else {
        // 点赞
        await db.collection('comment_likes').add({
          data: {
            user_id: userId,
            comment_id: comment_id,
            create_time: new Date()
          }
        })
        await db.collection('comment').doc(comment_id).update({
          data: {
            like_count: _.inc(1)
          }
        })
        isLiked = true
      }
    }

    // 获取最新点赞数
    const commentRes = await db.collection('comment').doc(comment_id).get()
    const likeCount = commentRes.data?.like_count || 0

    return {
      code: 0,
      message: 'success',
      data: {
        is_liked: isLiked,
        like_count: likeCount
      }
    }
  } catch (error) {
    console.error('点赞失败:', error)
    return {
      code: 500,
      message: '操作失败',
      error: error.message
    }
  }
}
