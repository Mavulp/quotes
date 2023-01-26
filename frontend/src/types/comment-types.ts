export interface Comment {
  author: string
  createdAt: number
  id: number
  quoteId: number
  text: string
}

export interface CreateComment {
  text: string
}
