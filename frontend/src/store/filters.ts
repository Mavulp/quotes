import { defineStore } from "pinia"

interface State {
  search: string
}

export const useFilters = defineStore("filters", {
  state: () =>
    ({
      search: ""
    } as State),
  actions: {
    setSearch(value: string) {
      this.search = value
    },
    clearSearch() {
      this.search = ""
    }
  }
})
