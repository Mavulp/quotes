import { defineStore } from 'pinia'
import type { Quote } from '../types/quote-types'

type FilterKey = 'author' | 'quotee' | 'tag'
interface OptionValue {
  value: string
  label: string
}

interface State {
  search: string
  options: Record<FilterKey, Set<string>>
  filters: Map<FilterKey, Set<string>>
}

export const useFilters = defineStore('filters', {
  state: () => ({
    search: '',
    options: {
      author: new Set(),
      quotee: new Set(),
    },
    filters: new Map(),
  } as State),
  actions: {
    init(quotes: Quote[]) {
      // Iterate over all quotes and extract unique filterable values
      for (const quote of quotes) {
        this.options.author.add(quote.author)
        const quotees = quote.fragments.map(fragment => fragment.quotee)
        quotees.map(q => this.options.quotee.add(q))
      }
    },
    setSearch(value: string) {
      this.search = value
    },
    clearSearch() {
      this.search = ''
    },
    setFilter(key: FilterKey, values: string[]) {
      this.filters.set(key, new Set(values))
    },
  },
  getters: {
    getOptionsByKey: state => (key: FilterKey): OptionValue[] => {
      return [...state.options[key] ?? []].map((option) => {
        return {
          // TODO: add usernames x displayNames
          label: option,
          value: option,
        }
      })
    },
    getFiltersByKey: state => (key: FilterKey) => {
      const filters = state.filters.get(key) ?? []
      return [...filters]
    },
  },
})
