import { defineStore } from 'pinia'
import { post, put } from '../bin/fetch'
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
  editing: number | null
}

const defaultQuote: CreateQuote = {
  tags: [],
  fragments: [],
  offensive: null,
}

function getBody(form: CreateQuote) {
  const {
    offensive,
    fragments,
    tags,
  } = form

  return {
    fragments,
    offensive: offensive === 'yes',
    tags: [...tags],
  }
}

export const useCreate = defineStore('create', {
  state: () => ({
    form: structuredClone(defaultQuote),
    dragIndex: null,
    editing: null,
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

      const body = getBody(this.form)

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
    async updateQuote() {
      const { push } = useToast()
      const loading = useLoading()

      loading.add('update')

      const body = getBody(this.form)

      return put('/quote', body)
        .then((res) => {
          push({ type: 'success', message: 'Succesfully updates quote' })
          return res
        })
        .catch(() => {
          push({ type: 'error', message: 'Error updating quote' })
          return null
        })
        .finally(() => {
          this.reset()
          loading.del('update')
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
