<script setup lang='ts'>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useQuote } from '../../store/quote'
import { objectToArray } from '../../bin/utils'
import { dateRange } from '../../bin/time'

const quote = useQuote()

type Metric = Record<string, number>

const quotesPerDay = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  // Convert the entire timestmap to just the day
  const fullDay = dayjs.utc(quote.createdAt * 1000).startOf('day').format()

  if (group[fullDay])
    group[fullDay]++
  else
    group[fullDay] = 1

  return group
}, {} as Metric)))

// Get all years
const tabs = computed(() => {
  if (!quotesPerDay.value)
    return []

  const range = dateRange(
    Object.keys(quotesPerDay.value.at(0))[0],
    Object.keys(quotesPerDay.value.at(-1))[0],
    'year',
  )
})
</script>

<template>
  <div>
    <pre>
      {{ quotesPerDay }}
     </pre>
  </div>
</template>
