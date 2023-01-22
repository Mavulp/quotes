import { shuffle } from 'lodash'
import { defineStore } from 'pinia'
import { get } from '../bin/fetch'
// import type { FetchError } from '../types/fetch-types'
import type { Quote } from '../types/quote-types'
import { useFilters } from './filters'
import { useLoading } from './loading'
import { useToast } from './toast'

interface State {
  quotes: Quote[]
  // random: () number
}

export const useQuote = defineStore('quotes', {
  state: () => ({
    quotes: [],
    // randomQuoteId: fn,
  } as State),
  actions: {
    async fetchQuotes(): Promise<Quote[]> {
      const loading = useLoading()
      const toast = useToast()

      loading.add('quote-list')

      return get('/quote')
        .then((res: Quote[]) => {
          const filters = useFilters()
          filters.init(res)

          this.quotes = res.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)
          return res
        })
        .catch(() => {
          toast.push({ type: 'error', message: 'Error fetching quotes' })

          return []
        })
        .finally(() => loading.del('quote-list'))
    },

    async fetchQuote(id: number): Promise<Quote> {
      const loading = useLoading()
      loading.add('quote-detail')

      return get(`/quote/${id}`)
        .then(res => res)
        .catch(() => {
        })
        .finally(() => loading.del('quote-detail'))
    },

    getRandomQuoteId() {
      return shuffle(this.quotes)[0].id
    },
  },
  // getters: {},
})
