import { defineStore } from 'pinia'
import { post } from '../bin/fetch'
import type {
  CreateQuote,
  ImageFragment,
  TextFragment,
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
    addFragment(fragmentType: string) {
      const [type, highlight] = fragmentType.split('-')

      const fragment: ImageFragment | TextFragment = {
        type: type as 'text' | 'image',
        content: '',
        quotee: '',
        highlight: highlight === 'highlight',
      }

      if (fragment) {
        this.form.fragments.set(this._index, fragment)
        this._index++
      }
    },
    editFragment(
      index: number,
      updated: ImageFragment | TextFragment,
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
          field: keyof TextFragment | keyof ImageFragment,
        ) => {
          const block = state.form.fragments.get(id)

          if (!block)
            return null

          return Reflect.get(block, field)
        },
  },
})
