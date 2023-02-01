<script setup lang='ts'>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useQuote } from '../../store/quote'
import { getKey, objectToArray } from '../../bin/utils'
import Tabs from '../Tabs.vue'
import YearItem from './YearItem.vue'

const quote = useQuote()

const quotesPerDay = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  // Convert the entire timestmap to just the day
  const fullDay = dayjs.utc(quote.createdAt * 1000).startOf('day').format()

  if (group[fullDay])
    group[fullDay]++
  else
    group[fullDay] = 1

  return group
}, {} as Record<string, number>)))

const uniqueYears = computed(() => Array.from(new Set(quotesPerDay.value.map(quote => dayjs.utc(getKey(quote)).year()))))

function getQuotesPerYear(year: number) {
  return quotesPerDay.value.filter(item => dayjs.utc(getKey(item)).year() === year)
}
</script>

<template>
  <div class="year-breakdown">
    <Tabs compact :tabs="uniqueYears">
      <template v-for="tab in uniqueYears" :key="tab" #[tab]>
        <YearItem :data="getQuotesPerYear(tab)" />
      </template>
    </Tabs>
  </div>
</template>
