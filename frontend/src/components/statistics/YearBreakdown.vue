<script setup lang='ts'>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useQuote } from '../../store/quote'
import { getKey, objectToArray } from '../../bin/utils'
import Tabs from '../Tabs.vue'
import type { DateCount } from '../../types/quote-types'
import YearItem from './YearItem.vue'

const quote = useQuote()

const quotesPerDay = computed(() => quote.quotes.reduce((group, quote) => {
  // Convert the entire timestmap to just the day
  const fullDay = dayjs.utc(quote.createdAt * 1000).startOf('day').format()

  if (group[fullDay]) {
    group[fullDay].count++
  }
  else {
    group[fullDay] = {
      count: 1,
      date: quote.createdAt * 1000,
    }
  }

  return group
}, {} as Record<string, DateCount>))

const uniqueYears = computed(() => [...new Set(Object.values(quotesPerDay.value).filter(q => q.date !== 0).map(q => dayjs.utc(q.date).year()))])

function getQuotesPerYear(year: number) {
  return Object.values(quotesPerDay.value).filter(q => dayjs.utc(q.date).year() === year)
}
</script>

<template>
  <div class="year-breakdown">
    <Tabs compact :tabs="uniqueYears">
      <template v-for="year in uniqueYears" :key="year" #[year]>
        <YearItem :data="getQuotesPerYear(year)" :year="year" />
      </template>
    </Tabs>
  </div>
</template>
