export type Fragments = 'image' | 'context' | 'highlight'

export interface ImageFragment {
  type: 'image'
  content: string
  quotee: string
  highlight: boolean
}

export interface ContextFragment {
  type: 'context'
  content: string
  quotee: string
  highlight: boolean
}

export interface HighlightFragment {
  type: 'highlight'
  content: string
  quotee: string
}

export interface Quotee {
  quotee: string
  index: number
}

export interface Quote {
  id: number
  author: string
  indices: Quotee[]
  offensive: boolean
  createdAt: number
  tags?: string
  legacy?: boolean
  fragments: Array<HighlightFragment | ContextFragment | ImageFragment>
}

interface BaseCreateQuote {
  tags?: string
  offensive: 'yes' | 'no' | null
  comments: boolean
  // anonymous: boolean
  // anonymousQuotees: boolean
}

export interface CreateQuote extends BaseCreateQuote {
  fragments: Map<number, HighlightFragment | ContextFragment | ImageFragment>
}

export interface NewQuote extends BaseCreateQuote {
  fragments: Array<HighlightFragment | ContextFragment | ImageFragment>
}
