export type Fragments = 'image' | 'context' | 'highlight'

export interface ImageQuoteContent {
  type: 'image'
  url: string
  quotee: string
  highlight: boolean
}

export interface ContextQuoteContent {
  type: 'context'
  text: string
  quotee: string
  highlight: boolean
}

export interface HighlightQuoteContent {
  type: 'highlight'
  content: string
  quotee: string
}

export interface Quotee {
  username: string
  index: number
}

export interface Quote {
  id: number
  author: string
  // quotees: Quotee[]
  offensive: boolean
  createdAt: number
  location?: string
  legacy?: boolean
  fragments: Array<HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}

interface BaseCreateQuote {
  location?: string
  offensive: boolean | null
  comments: boolean
  anonymous: boolean
  anonymousQuotees: boolean
}

export interface CreateQuote extends BaseCreateQuote {
  fragments: Map<number, HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}

export interface NewQuote extends BaseCreateQuote {
  fragments: Array<HighlightQuoteContent | ContextQuoteContent | ImageQuoteContent>
}
