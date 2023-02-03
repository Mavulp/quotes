<script setup lang='ts'>
import dayjs from 'dayjs'
import { computed, ref } from 'vue'
import { diffDate } from '../../bin/time'
import { useQuote } from '../../store/quote'
import type { Quote } from '../../types/quote-types'
import { DateCount } from '../../types/quote-types'

import Bar from '../charts/Bar.vue'

const props = defineProps<{
  range: [Quote, Quote]
}>()

const quote = useQuote()

const difference = computed(() => {
  const [first, last] = props.range
  return diffDate(last.createdAt * 1000, first.createdAt * 1000, 'day')
})

// const authors = computed(() => {
//   // #1 Iterate over all users and save their quotes by date
//   return quote.quotes.reduce((group, quote) => {
//     const day = dayjs.utc(quote.createdAt)

//     group[quote.author] ? group[quote.author].count++ : group[quote.author] = {
//       count: 1,
//       date: quote.createdAt
//     }
//     if ()

//   }, {} as Record<string, DateCount>)
// })
</script>

<template>
  <div>
    {{ difference }}
  </div>
</template>
