import { defineStore } from 'pinia'

interface State {
  loading: Set<string>
}

export const useLoading = defineStore('loading', {
  state: () => ({
    loading: new Set(),
  } as State),
  actions: {
    add(...items: Array<string>) {
      if (items.length > 0) {
        for (const item of items)
          this.loading.add(item)
      }
    },
    del(...items: Array<string>) {
      if (items.length > 0) {
        for (const item of items)
          this.loading.delete(item)
      }
    },
  },
  getters: {
    get:
      state =>
        (...items: Array<string>) => {
          if (items.length > 0)
            return Array.from(state.loading).some((item: any) => items.includes(item))

          return state.loading.size > 0
        },
  },
})
