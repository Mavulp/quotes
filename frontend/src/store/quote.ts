import { defineStore } from 'pinia'
import { get, signal } from '../bin/fetch'
// import type { FetchError } from '../types/fetch-types'
import type { Quote } from '../types/quote-types'
import { useLoading } from './loading'

interface State {
  quotes: Quote[]
}

export const useQuote = defineStore('quotes', {
  state: () => ({
    quotes: [],
  } as State),
  actions: {
    async fetchQuotes() {
      const loading = useLoading()

      loading.add('quote-list')

      // this.quotes = [
      //   {
      //     id: 0,
      //     quotees: [
      //       { username: 'tmtu', index: 123 },
      //       { username: 'dolanske', index: 51 },
      //       { username: 'kilmanio', index: 88 },
      //       { username: 'rapid', index: 6 },
      //     ],
      //     author: 'Rapid',
      //     createdAt: 1660230623849,
      //     location: 'irl - Norway',
      //     offensive: false,
      //     blocks: [
      //       {
      //         type: 'context',
      //         quotee: 'dolanske',
      //         text: 'So anyway, just shift to second gear and you will be ok',
      //         highlight: false,
      //       },
      //       {
      //         type: 'context',
      //         quotee: 'tmtu',
      //         text: 'What do you mean shift to second gear? This is my first time driving a car',
      //         highlight: false,
      //       },
      //       {
      //         type: 'highlight',
      //         quotee: 'Isuk',
      //         text: 'Dude you are on a donkey and it is not even remotely funny',
      //         highlight: true,
      //       },
      //       {
      //         type: 'image',
      //         quotee: 'chantaro',
      //         url: 'https://i.imgur.com/nKhJQGw.png',
      //         highlight: true,
      //       },
      //       {
      //         type: 'context',
      //         quotee: 'dolanske',
      //         text: 'So anyway, just shift to second gear and you will be ok',
      //         highlight: false,
      //       },
      //       {
      //         type: 'context',
      //         quotee: 'tmtu',
      //         text: 'What do you mean shift to second gear? This is my first time driving a car',
      //         highlight: false,
      //       },
      //       {
      //         type: 'highlight',
      //         quotee: 'Isuk',
      //         text: 'Dude you are on a donkey and it is not even remotely funny',
      //         highlight: true,
      //       },
      //       {
      //         type: 'image',
      //         quotee: 'chantaro',
      //         url: 'https://i.imgur.com/nKhJQGw.png',
      //         highlight: false,
      //       },
      //     ],
      //   },
      // ]

      return get('/quote', { signal })
        .then((res) => {
          this.quotes = res
          return res
        })
        .catch(() => {
          // Do err
          // e
        })
        .finally(() => loading.del('quote-list'))
    },
  },
  getters: {},
})
