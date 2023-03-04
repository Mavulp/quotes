import type { RemovableRef } from '@vueuse/core'
import { useLocalStorage } from '@vueuse/core'
import { isArray } from 'lodash'
import { defineStore } from 'pinia'
import { get } from '../bin/fetch'
import type { Quote } from '../types/quote-types'
import { useLoading } from './loading'

type FilterKey = 'author' | 'quotee' | 'tag' | 'excludedTags'

interface Tag {
  id: string
  name: string
  description: string
}

interface OptionValue {
  value: string
  label: string
}

interface State {
  search: string
  options: Record<Exclude<FilterKey, 'excludedTags'>, Set<string>>
  filters: Map<FilterKey, Set<string>>
  tags: Tag[]
  excludedTags: string[]

  expand: RemovableRef<boolean>
  offensive: RemovableRef<boolean>
}

function assignExcludedTags(): string[] {
  const local = localStorage.getItem('quotes_excluded_tags')
  if (!local)
    return []
  return JSON.parse(local)
}

export const useFilters = defineStore('filters', {
  state: () => ({
    search: '',
    options: {
      author: new Set(),
      quotee: new Set(),
      tag: new Set(),
    },
    filters: new Map(),
    tags: [],
    excludedTags: assignExcludedTags(),
    expand: useLocalStorage('quotes_expanded', false),
    offensive: useLocalStorage('quotes_expanded', false),
  } as State),
  actions: {
    init(quotes: Quote[]) {
      const loading = useLoading()
      loading.add('filters')

      // Iterate over all quotes and extract unique filterable values
      for (const quote of quotes) {
        this.options.author.add(quote.author)
        const quotees = quote.indices.map(user => user.quotee)
        quotees.map(q => this.options.quotee.add(q))
      }

      get('/tag')
        .then((res: Tag[]) => {
          // Save tags as full objects
          this.tags = res
          // To options, save tag names
          this.options.tag = new Set(res.map(tag => tag.name))
        })
        .finally(() => loading.del('filters'))
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
    clear() {
      this.search = ''
      this.filters = new Map()
    },
  },
  getters: {
    getOptionsByKey: state => (key: Exclude<FilterKey, 'excludedTags'>): OptionValue[] => {
      return [...state.options[key] ?? []].map((option) => {
        return {
          label: option,
          value: option,
        }
      })
    },
    getFiltersByKey: state => (key: FilterKey) => {
      const filters = state.filters.get(key) ?? []
      return Array.from(filters)
    },
    isPassingFilter() {
      return (key: FilterKey, value: string | string[]) => {
        const active = this.getFiltersByKey(key)

        if (active.length === 0)
          return true

        return isArray(value) ? value.some(val => active.includes(val)) : active.includes(value)
      }
    },
    active: state => [...state.filters.values()].some(data => data.size > 0) || state.search.length > 0,
  },
})
