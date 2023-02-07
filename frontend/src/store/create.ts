import { defineStore } from 'pinia'
import { del, post, put } from '../bin/fetch'
import type {
  CreateQuote,
  ImageFragment,
  Quote,
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
      this.editing = null
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
          push({ type: 'success', message: 'Successfully added new quote' })
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

      return put(`/quote/${this.editing}`, body)
        .then(() => {
          push({ type: 'success', message: 'Successfully updates quote' })
          return this.editing
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
    prefillForm(quote: Quote) {
      this.editing = quote.id

      Object.assign(this.form, {
        fragments: quote.fragments,
        tags: quote.tags,
        offensive: quote.offensive ? 'yes' : 'no',
      })
    },
    async removeQuote() {
      const { push } = useToast()
      const loading = useLoading()

      loading.add('delete')

      return del(`/quote/${this.editing}`)
        .then(() => {
          push({ type: 'success', message: 'Successfully deleted quote' })
          this.reset()
        })
        .catch(() => {
          push({ type: 'error', message: 'Error deleting quote' })
        })
        .finally(() => {
          loading.del('delete')
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
