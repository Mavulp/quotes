import { defineStore } from 'pinia'
import { post } from '../bin/fetch'
import type {
  CreateQuote,
  ImageFragment,
  TextFragment,
} from '../types/quote-types'
import { useLoading } from './loading'
import { useToast } from './toast'

interface State {
  form: CreateQuote
  // _index: number
}

const defaultQuote: CreateQuote = {
  tags: null,
  fragments: [],
  offensive: null,
}

export const useCreate = defineStore('create', {
  state: () => ({
    form: {},
    // _index: 0,
  } as State),
  actions: {
    reset() {
      this.form = structuredClone(defaultQuote)
      // this._index = 0
    },
    addFragment(fragmentType: string) {
      const [type, highlight] = fragmentType.split('-')

      const fragment: ImageFragment | TextFragment = {
        type: type as 'text' | 'image',
        content: '',
        quotee: '',
        highlight: highlight === 'highlight',
      }

      if (fragment)
        this.form.fragments.push(fragment)
      // this.form.fragments.set(this._index, fragment)
      // this._index++
    },
    editFragment(
      index: number,
      updated: ImageFragment | TextFragment,
    ) {
      this.form.fragments.splice(index, 1, updated)
    },
    delFragment(index: number) {
      // this.form.fragments.delete(index)
      this.form.fragments.splice(index, 1)
      // this._index--
    },
    async submitQuote() {
      const { push } = useToast()
      const loading = useLoading()

      loading.add('create')

      const {
        offensive,
        fragments,
        tags,
      } = this.form

      const body = {
        fragments,
        offensive: offensive === 'yes',
        tags: tags ? tags?.trim().split(',') : [],
      }

      return post('/quote', body)
        .then(() => {
          push({ type: 'success', message: 'Succesfully added new quote' })
        })
        .catch(() => {
          push({ type: 'error', message: 'Error adding new quote' })
        })
        .finally(() => {
          loading.del('create')
        })
    },
  },
  getters: {
    getBlockValue:
      state =>
        (
          index: number,
          field: keyof TextFragment | keyof ImageFragment,
        ) => {
          const block = state.form.fragments.at(index)

          if (!block)
            return null

          return Reflect.get(block, field)
        },
  },
})
