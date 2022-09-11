export type Blocks = "image" | "context" | "highlight"

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

export interface Quote {
  id: number
  author: string
  quotees: Quotee[]
  offensive: boolean
  createdAt: number
  location?: string
  legacy?: boolean
  blocks: Array<HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}

interface BaseCreateQuote {
  location?: string
  offensive: boolean | null
  comments: boolean
  anonymous: boolean
  anonymousQuotees: boolean
}

export interface CreateQuote extends BaseCreateQuote {
  blocks: Map<number, HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}

export interface NewQuote extends BaseCreateQuote {
  blocks: Array<HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}
