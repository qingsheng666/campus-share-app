// 获取帖子详情云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { post_id, current_user_id } = event

  if (!post_id) {
    return {
      code: 400,
      message: '缺少帖子ID'
    }
  }

  try {
    // 获取帖子
    const postRes = await db.collection('post').doc(post_id).get()

    if (!postRes.data) {
      return {
        code: 404,
        message: '帖子不存在'
      }
    }

    const post = postRes.data

    // 获取发布者信息
    let user = null
    if (post.user_id) {
      try {
        const userRes = await db.collection('users').doc(post.user_id).get()
        user = userRes.data
      } catch (e) {
        console.log('获取用户信息失败', e)
      }
    }

    // 检查当前用户是否已点赞
    let is_liked = false
    if (current_user_id) {
      try {
        const likeRes = await db.collection('post_likes')
          .where({
            user_id: current_user_id,
            post_id: post_id
          })
          .get()
        is_liked = likeRes.data && likeRes.data.length > 0
      } catch (e) {
        console.log('检查点赞状态失败', e)
      }
    }

    // 格式化返回数据
    const formattedPost = {
      ...post,
      is_liked: is_liked,
      nickname: user?.nickname || '用户',
      avatar: user?.avatar || ''
    }

    return {
      code: 0,
      message: 'success',
      data: {
        post: formattedPost,
        user: user
      }
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    return {
      code: 500,
      message: '获取失败',
      error: error.message
    }
  }
}
