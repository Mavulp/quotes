export type Fragments = 'image' | 'text'

export interface ImageFragment {
  type: 'image'
  content: string
  quotee: string
  highlight: boolean
}

export interface TextFragment {
  type: 'text'
  content: string
  quotee: string
  highlight: boolean
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
  tags: string[]
  legacy?: boolean
  fragments: Array<TextFragment | ImageFragment>
}

interface BaseCreateQuote {
  tags: string | null
  offensive: 'yes' | 'no' | null
  // comments: boolean
  // anonymous: boolean
  // anonymousQuotees: boolean
}

export interface CreateQuote extends BaseCreateQuote {
  fragments: Map<number, TextFragment | ImageFragment>
}

export interface NewQuote extends BaseCreateQuote {
  fragments: Array<TextFragment | ImageFragment>
}
