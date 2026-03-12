// 云函数：点赞/取消点赞帖子
// 防止同一用户重复点赞

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const { post_id, action = 'toggle' } = event

  // 验证参数
  if (!post_id) {
    return {
      code: -1,
      message: '缺少 post_id 参数'
    }
  }

  const wxContext = cloud.getWXContext()
  const user_id = wxContext.OPENID || wxContext.UNIONID || event.user_id

  if (!user_id) {
    return {
      code: -2,
      message: '无法获取用户信息'
    }
  }

  try {
    // 查询是否已点赞
    const likeRes = await db.collection('post_likes')
      .where({
        user_id,
        post_id
      })
      .get()

    const hasLiked = likeRes.data.length > 0

    let isLiked = false

    if (action === 'toggle') {
      if (hasLiked) {
        // 取消点赞
        await db.collection('post_likes')
          .where({
            user_id,
            post_id
          })
          .remove()

        // 减少点赞数
        await db.collection('post').doc(post_id).update({
          like_count: _.inc(-1)
        })

        isLiked = false
      } else {
        // 点赞
        await db.collection('post_likes').add({
          user_id,
          post_id,
          create_time: new Date()
        })

        // 增加点赞数
        await db.collection('post').doc(post_id).update({
          like_count: _.inc(1)
        })

        isLiked = true
      }
    } else if (action === 'like' && !hasLiked) {
      // 只点赞（如果未点赞）
      await db.collection('post_likes').add({
        user_id,
        post_id,
        create_time: new Date()
      })

      await db.collection('post').doc(post_id).update({
        like_count: _.inc(1)
      })

      isLiked = true
    } else if (action === 'unlike' && hasLiked) {
      // 只取消点赞（如果已点赞）
      await db.collection('post_likes')
        .where({
          user_id,
          post_id
        })
        .remove()

      await db.collection('post').doc(post_id).update({
        like_count: _.inc(-1)
      })

      isLiked = false
    } else {
      isLiked = hasLiked
    }

    // 获取最新点赞数
    const postRes = await db.collection('post').doc(post_id).get()
    const like_count = postRes.data?.like_count || 0

    return {
      code: 0,
      message: 'success',
      data: {
        is_liked: isLiked,
        like_count
      }
    }

  } catch (error) {
    console.error('likePost error:', error)
    return {
      code: -3,
      message: '操作失败',
      error: error.message
    }
  }
}
