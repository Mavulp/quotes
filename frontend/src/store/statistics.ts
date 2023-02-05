import { isEmpty } from 'lodash'
import { defineStore } from 'pinia'
import { get } from '../bin/fetch'
import type { StatisticsChartRaw } from '../types/statistics-types'
import { useLoading } from './loading'

interface State {
  quotee: StatisticsChartRaw
}

export const useStats = defineStore('stats', {
  state: () => ({
    quotee: {},
  } as State),
  actions: {
    async fetchQuoteeStats() {
      if (!isEmpty(this.quotee))
        return Promise.resolve(this.quotee)

      const { add, del } = useLoading()

      add('stats-quotee')

      return get<StatisticsChartRaw>('/stats/quotee')
        .then(res => this.quotee = res)
        .finally(() => del('stats-quotee'))
    },
  },
  getters: {
    getQuoteeStatistics: state => state.quotee,
  },
})
