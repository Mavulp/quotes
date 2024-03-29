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
  tags: Tag[]
  offensive: 'yes' | 'no' | null
  fragments: Array<TextFragment | ImageFragment>
}

export interface Tag {
  name: string
  id: number
  description: string
  author: string
  createdAt: number
}

export interface DateCount {
  date: number
  count: number
}
