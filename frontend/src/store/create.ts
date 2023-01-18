import { defineStore } from 'pinia'
import type {
  ContextFragment,
  CreateQuote,
  Fragments,
  HighlightFragment,
  ImageFragment,
} from '../types/quote-types'

interface State {
  form: CreateQuote
  _index: number
}

// TODO: Add a type for CreateQuote
// Before submitting, this object will get serialized to
// correctly match the NewQuote interface
const defaultQuote: CreateQuote = {
  location: '',
  fragments: new Map(),
  offensive: null,
  comments: true,
  anonymous: false,
  anonymousQuotees: false,
}

// Tuple of available blocks
const defaultFragments: [ImageFragment, ContextFragment, HighlightFragment] = [
  { type: 'image', url: '', quotee: '', highlight: false },
  { type: 'context', text: '', quotee: '', highlight: false },
  { type: 'highlight', text: '', quotee: '', highlight: false },
]

export const useCreate = defineStore('create', {
  state: () => ({
    form: {},
    _index: 0,
  } as State),
  actions: {
    reset() {
      this.form = structuredClone(defaultQuote)
      this._index = 0
    },
    appendBlock(type: Fragments) {
      const block = structuredClone(defaultFragments.find(block => block.type === type))

      if (block) {
        this.form.fragments.set(this._index, block)
        this._index++
      }
    },
    editBlock(
      index: number,
      updated: ImageFragment | ContextFragment | HighlightFragment,
    ) {
      this.form.fragments.set(index, updated)
    },
    delBlock(index: number) {
      this.form.fragments.delete(index)
      this._index--
    },
  },
  getters: {
    getBlockValue:
      state =>
        (
          id: number,
          field: keyof ImageFragment | keyof ContextFragment | keyof HighlightFragment,
        ) => {
          const block = state.form.fragments.get(id)

          if (!block)
            return null

          return Reflect.get(block, field)
        },
  },
})
