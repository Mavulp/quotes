export type ImageQuoteContent = {
  type: "image"
  url: string
  quotee: string
  highlight: boolean
}

export type ContextQuoteContent = {
  type: "context"
  text: string
  quotee: string
  highlight: boolean
}

export type HighlightQuoteContent = {
  type: "highlight"
  text: string
  quotee: string
  highlight: boolean
}

export type Quotee = {
  username: string
  index: number
}

interface BaseQuote {
  id: number
  quotees: Quotee[]
  offensive: boolean
  location?: string
  blocks: Array<HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}

export interface Quote extends BaseQuote {
  author: string
  createdAt: number
}

export interface NewQuote extends BaseQuote {
  comments: boolean
  anonymous: boolean
  anonymousQuotees: boolean
}
