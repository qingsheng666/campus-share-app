// 云函数：获取本校帖子
// 权限控制：只返回和请求者 school_id 相同的帖子

const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 格式化时间为相对时间
function formatRelativeTime(date) {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString('zh-CN')
}

exports.main = async (event, context) => {
  const { school_id, page = 1, pageSize = 20, lastCreateTime = null } = event

  // 验证参数
  if (!school_id) {
    return {
      code: -1,
      message: '缺少 school_id 参数'
    }
  }

  try {
    let query = db.collection('post')
      .where({
        school_id: school_id,
        status: 0 // 只显示审核通过的帖子
      })
      .orderBy('create_time', 'desc')

    // 如果有上次加载的时间，用于分页（避免skip性能问题）
    if (lastCreateTime) {
      query = query.where({
        school_id: school_id,
        status: 0,
        create_time: _.lt(new Date(lastCreateTime))
      })
    }

    // 获取帖子列表
    const postRes = await query
      .limit(pageSize)
      .get()

    const posts = postRes.data

    if (posts.length === 0) {
      return {
        code: 0,
        message: 'success',
        data: {
          list: [],
          hasMore: false
        }
      }
    }

    // 获取所有发布者的 user_id
    const userIds = [...new Set(posts.map(p => p.user_id))]

    // 获取用户信息（头像、昵称）
    let userMap = {}
    if (userIds.length > 0) {
      const userRes = await db.collection('users')
        .where({
          _id: _.in(userIds)
        })
        .get()

      userRes.data.forEach(user => {
        userMap[user._id] = {
          nickname: user.nickname,
          avatar: user.avatar
        }
      })
    }

    // 获取当前用户已点赞的帖子
    const wxContext = cloud.getWXContext()
    const currentUserId = wxContext.OPENID || wxContext.UNIONID || event.current_user_id
    let likedPostIds = []

    if (currentUserId) {
      const likeRes = await db.collection('post_likes')
        .where({
          user_id: currentUserId,
          post_id: _.in(posts.map(p => p._id))
        })
        .get()
      likedPostIds = likeRes.data.map(l => l.post_id)
    }

    // 组装返回数据
    const list = posts.map(post => ({
      _id: post._id,
      user_id: post.user_id,
      school_id: post.school_id,
      content: post.content,
      images: post.images || [],
      like_count: post.like_count || 0,
      comment_count: post.comment_count || 0,
      create_time: post.create_time,
      // 扩展字段
      nickname: userMap[post.user_id]?.nickname || '匿名用户',
      avatar: userMap[post.user_id]?.avatar || '',
      is_liked: likedPostIds.includes(post._id),
      time: formatRelativeTime(post.create_time)
    }))

    // 判断是否还有更多
    const hasMore = posts.length === pageSize

    return {
      code: 0,
      message: 'success',
      data: {
        list,
        hasMore,
        lastCreateTime: posts.length > 0 ? posts[posts.length - 1].create_time : null
      }
    }

  } catch (error) {
    console.error('getSchoolPosts error:', error)
    return {
      code: -2,
      message: '获取帖子失败',
      error: error.message
    }
  }
}
