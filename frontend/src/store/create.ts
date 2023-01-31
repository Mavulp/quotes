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
  dragIndex: number | null
}

const defaultQuote: CreateQuote = {
  tags: [],
  fragments: [],
  offensive: null,
}

export const useCreate = defineStore('create', {
  state: () => ({
    form: structuredClone(defaultQuote),
    dragIndex: null,
  } as State),
  actions: {
    reset() {
      this.form = structuredClone(defaultQuote)
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
    },
    editFragment(
      index: number,
      updated: ImageFragment | TextFragment,
    ) {
      this.form.fragments.splice(index, 1, updated)
    },
    delFragment(index: number) {
      this.form.fragments.splice(index, 1)
    },
    async submitQuote(): Promise<number | null> {
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
        tags: [...tags],
      }

      return post('/quote', body)
        .then((res) => {
          push({ type: 'success', message: 'Succesfully added new quote' })
          return res
        })
        .catch(() => {
          push({ type: 'error', message: 'Error adding new quote' })
          return null
        })
        .finally(() => {
          this.reset()
          loading.del('create')
        })
    },
    setDragIndex(index: number | null) {
      this.dragIndex = index
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
