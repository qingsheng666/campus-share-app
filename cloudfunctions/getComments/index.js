// 获取评论列表云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { post_id, pageSize = 20, lastCreateTime, current_user_id } = event

  if (!post_id) {
    return {
      code: 400,
      message: '缺少帖子ID'
    }
  }

  try {
    // 构建查询
    let query = db.collection('comment')
      .where({
        post_id: post_id,
        parent_id: '0', // 只查一级评论
        status: 0
      })

    if (lastCreateTime) {
      query = query.where({
        create_time: _.gt(new Date(lastCreateTime))
      })
    }

    const res = await query
      .orderBy('create_time', 'asc') // 正序排列
      .limit(pageSize)
      .get()

    const comments = res.data || []

    if (comments.length === 0) {
      return {
        code: 0,
        message: 'success',
        data: {
          list: [],
          hasMore: false
        }
      }
    }

    // 获取所有相关用户ID
    const userIds = new Set()
    const commentIds = []
    comments.forEach(c => {
      userIds.add(c.user_id)
      if (c.reply_user_id) {
        userIds.add(c.reply_user_id)
      }
      commentIds.push(c._id)
    })

    // 查询二级回复
    let replies = []
    if (commentIds.length > 0) {
      try {
        const repliesRes = await db.collection('comment')
          .where({
            parent_id: _.in(commentIds),
            status: 0
          })
          .orderBy('create_time', 'asc')
          .limit(100)
          .get()
        replies = repliesRes.data || []
        replies.forEach(r => {
          userIds.add(r.user_id)
          if (r.reply_user_id) {
            userIds.add(r.reply_user_id)
          }
        })
      } catch (e) {
        console.log('获取回复失败', e)
      }
    }

    // 查询用户信息
    const userMap = {}
    if (userIds.size > 0) {
      try {
        const userRes = await db.collection('users')
          .where({
            _id: _.in(Array.from(userIds))
          })
          .get()
        userRes.data.forEach(u => {
          userMap[u._id] = u
        })
      } catch (e) {
        console.log('获取用户信息失败', e)
      }
    }

    // 查询当前用户点赞状态
    const likedCommentIds = new Set()
    if (current_user_id) {
      try {
        const likeRes = await db.collection('comment_likes')
          .where({
            user_id: current_user_id,
            comment_id: _.in([...commentIds, ...replies.map(r => r._id)])
          })
          .get()
        likeRes.data.forEach(l => likedCommentIds.add(l.comment_id))
      } catch (e) {
        console.log('检查点赞状态失败', e)
      }
    }

    // 格式化时间
    const formatTime = (date) => {
      if (!date) return ''
      const d = new Date(date)
      const now = new Date()
      const diff = now - d
      const minute = 60 * 1000
      const hour = 60 * minute
      const day = 24 * hour

      if (diff < minute) return '刚刚'
      if (diff < hour) return Math.floor(diff / minute) + '分钟前'
      if (diff < day) return Math.floor(diff / hour) + '小时前'
      if (diff < 7 * day) return Math.floor(diff / day) + '天前'
      return `${d.getMonth() + 1}/${d.getDate()}`
    }

    // 组织回复数据
    const replyMap = {}
    replies.forEach(reply => {
      if (!replyMap[reply.parent_id]) {
        replyMap[reply.parent_id] = []
      }
      const replyUser = userMap[reply.user_id] || {}
      const repliedUser = reply.reply_user_id ? userMap[reply.reply_user_id] : null

      replyMap[reply.parent_id].push({
        ...reply,
        nickname: replyUser.nickname || '用户',
        avatar: replyUser.avatar || '',
        reply_nickname: repliedUser?.nickname,
        time: formatTime(reply.create_time),
        is_liked: likedCommentIds.has(reply._id)
      })
    })

    // 格式化一级评论
    const formattedList = comments.map(comment => {
      const commentUser = userMap[comment.user_id] || {}
      const repliedUser = comment.reply_user_id ? userMap[comment.reply_user_id] : null

      return {
        ...comment,
        nickname: commentUser.nickname || '用户',
        avatar: commentUser.avatar || '',
        reply_nickname: repliedUser?.nickname,
        time: formatTime(comment.create_time),
        is_liked: likedCommentIds.has(comment._id),
        replies: replyMap[comment._id] || []
      }
    })

    return {
      code: 0,
      message: 'success',
      data: {
        list: formattedList,
        hasMore: comments.length >= pageSize,
        lastCreateTime: comments.length > 0 ? comments[comments.length - 1].create_time : null
      }
    }
  } catch (error) {
    console.error('获取评论失败:', error)
    return {
      code: 500,
      message: '获取失败',
      error: error.message
    }
  }
}
