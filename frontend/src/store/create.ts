import { defineStore } from 'pinia'
import { post } from '../bin/fetch'
import type {
  ContextFragment,
  CreateQuote,
  Fragments,
  HighlightFragment,
  ImageFragment,
} from '../types/quote-types'
import { useToast } from './toast'

interface State {
  form: CreateQuote
  _index: number
}

// TODO: Add a type for CreateQuote
// Before submitting, this object will get serialized to
// correctly match the NewQuote interface
const defaultQuote: CreateQuote = {
  tags: '',
  fragments: new Map(),
  offensive: null,
  comments: true,
  // anonymous: false,
  // anonymousQuotees: false,
}

// Tuple of available blocks
const defaultFragments: [ImageFragment, ContextFragment, HighlightFragment] = [
  { type: 'image', content: '', quotee: '', highlight: false },
  { type: 'context', content: '', quotee: '', highlight: false },
  { type: 'highlight', content: '', quotee: '' },
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
    addFragment(type: Fragments) {
      const fragment = structuredClone(defaultFragments.find(fragment => fragment.type === type))

      if (fragment) {
        this.form.fragments.set(this._index, fragment)
        this._index++
      }
    },
    editFragment(
      index: number,
      updated: ImageFragment | ContextFragment | HighlightFragment,
    ) {
      this.form.fragments.set(index, updated)
    },
    delFragment(index: number) {
      this.form.fragments.delete(index)
      this._index--
    },

    async submitQuote() {
      const { push } = useToast()

      const {
        offensive,
        fragments,
        tags,
      } = this.form

      const body = {
        fragments: [...fragments.values()],
        offensive: offensive === 'yes',
        tags: tags?.trim().split(',') ?? [],
      }

      return post('/quote', body)
        .then(() => {
          push({ type: 'success', message: 'Succesfully added new quote' })
        })
        .catch(() => {
          push({ type: 'error', message: 'Error adding new quote' })
        })
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
