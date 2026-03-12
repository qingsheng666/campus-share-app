// 通用类型声明

declare global {
  /**
   * 分页查询参数
   */
  interface PageParams {
    page?: number
    pageSize?: number
  }

  /**
   * 分页返回结果
   */
  interface PageResult<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
  }

  /**
   * 用户信息
   */
  interface User {
    _id?: string
    phone?: string
    nickname: string
    avatar: string
    gender?: number
    school?: string
    major?: string
    grade?: string
    createTime?: Date
    updateTime?: Date
  }

  /**
   * 帖子信息
   */
  interface Post {
    _id?: string
    userId: string
    school: string
    category: string
    title: string
    content: string
    images?: string[]
    isAnonymous?: boolean
    viewCount?: number
    likeCount?: number
    commentCount?: number
    createTime?: Date
    updateTime?: Date
    // 扩展字段（用于展示）
    nickname?: string
    avatar?: string
    isLiked?: boolean
    time?: string
  }

  /**
   * 评论信息
   */
  interface Comment {
    _id?: string
    postId: string
    userId: string
    content: string
    createTime?: Date
    // 扩展字段
    nickname?: string
    avatar?: string
    time?: string
  }
}

export {}
