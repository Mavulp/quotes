import { defineStore } from 'pinia'
import { get, signal } from '../bin/fetch'
import { getRanMinMax } from '../bin/utils'
// import type { FetchError } from '../types/fetch-types'
import type { Quote } from '../types/quote-types'
import { useFilters } from './filters'
import { useLoading } from './loading'

interface State {
  quotes: Quote[]
  random: Set<number>
}

export const useQuote = defineStore('quotes', {
  state: () => ({
    quotes: [],
    random: new Set(),
  } as State),
  actions: {
    async fetchQuotes(): Promise<Quote[]> {
      const loading = useLoading()
      loading.add('quote-list')

      return get('/quote', { signal })
        .then((res) => {
          const filters = useFilters()
          filters.init(res)

          this.quotes = res
          return res
        })
        .catch(() => {
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

    randomQuoteId() {
      let id = -1

      do
        id = getRanMinMax(0, this.quotes.length)
      while (this.random.has(id))

      this.random.add(id)
      return id
    },

  },
  getters: {},
})
