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

export interface CreateQuote {
  tags: string | null
  offensive: 'yes' | 'no' | null
  fragments: Array<TextFragment | ImageFragment>
}
