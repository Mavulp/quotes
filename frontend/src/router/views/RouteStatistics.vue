<script setup lang='ts'>
import { computed } from 'vue'
import { findLast } from 'lodash'
import dayjs from 'dayjs'
import { useQuote } from '../../store/quote'
import { date, objectToArray, toNum } from '../../bin/utils'
import type { Quote } from '../../types/quote-types'
import { useLoading } from '../../store/loading'
import { useUser } from '../../store/user'

const quote = useQuote()
const loading = useLoading()
const user = useUser()

/**
 * Top level metrics
 */

const totalQuotes = computed(() => quote.quotes.length)
const totalAuthors = computed(() => new Set(quote.quotes.map(q => q.author)).size)
const firstUpload = computed(() => findLast(quote.quotes, q => q.createdAt !== 0))
const lastUpload = computed(() => quote.quotes.at(0) as Quote)
// const registeredUsers = computed(() => user.users.length)

type Metric = Record<string, number>

// Rank users by how many times they were quoted
const usersByQuotes = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  for (const item of quote.indices) {
    if (group[item.quotee])
      group[item.quotee]++

    else
      group[item.quotee] = 1
  }

  return group
}, {} as Metric)).sort((a, b) => Object.values(a)[0] < Object.values(b)[0] ? 1 : -1))

// Rank users by the amount of uploads
const usersByUploads = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  if (!group[quote.author])
    group[quote.author] = 1
  else
    group[quote.author]++

  return group
}, {} as Metric)).sort((a, b) => Object.values(a)[0] < Object.values(b)[0] ? 1 : -1))

// Most used tagts
const tagsByUsage = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  for (const tag of quote.tags) {
    if (group[tag])
      group[tag]++

    else
      group[tag] = 1
  }

  return group
}, {} as Metric)).sort((a, b) => Object.values(a)[0] < Object.values(b)[0] ? 1 : -1))

// Daily quotes
const quotesPerDay = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  // Convert the entire timestmap to just the day
  const fullDay = dayjs.utc(quote.createdAt * 1000).startOf('day').format()

  if (group[fullDay])
    group[fullDay]++
  else
    group[fullDay] = 1

  return group
}, {} as Metric)))

// Chart of uploads
// Compute daily uploads of quotes in the last 365 days
// const chart = computed(() => {
//   let labels: string[] = []
//   let data: number[] = []

//   for (let i = 0; i >= 365; i++) {
//     const date = dayjs.utc().subtract(i)
//     const
//   }

//   return {
//     labels,
//     datasets: [{
//       data,
//       backgroundColor: '#f29b41',
//       // borderColor:'#f29b41'
//     }]
//   }
// })
</script>

<template>
  <div class="route-statistics">
    <div class="quote-container">
      <h1>Statistics</h1>

      <Spinner v-if="loading.get('quotes', 'users')" />
      <template v-else>
        <div class="stats-grid">
          <div class="cell">
            <strong>{{ toNum(totalQuotes) }}</strong>
            <span>Quotes</span>
          </div>
          <div v-if="usersByQuotes" class="cell">
            <strong>{{ toNum(usersByQuotes.length) }}</strong>
            <span>Quotees</span>
          </div>
          <div class="cell">
            <strong>{{ toNum(totalAuthors) }}</strong>
            <span>Authors</span>
          </div>
          <div v-if="usersByQuotes" class="cell date">
            <strong>{{ Object.keys(usersByQuotes[0])[0] }}</strong>
            <span>Most Quoted</span>
          </div>
          <div class="cell date">
            <strong>{{ Object.keys(usersByUploads[0])[0] }}</strong>
            <span>Most Uploads</span>
          </div>
          <div class="cell date">
            <strong>#{{ Object.keys(tagsByUsage[0])[0] }}</strong>
            <span>Most Used Tag</span>
          </div>
          <div v-if="firstUpload" class="cell date">
            <strong>{{ date.timeShort(firstUpload.createdAt) }}</strong>
            <span>First Post </span>
          </div>
          <div v-if="lastUpload" class="cell date">
            <strong>{{ date.timeShort(lastUpload.createdAt) }}</strong>
            <span>Latest Post</span>
          </div>
        </div>
        <pre>{{ quotesPerDay }}</pre>
      </template>
    </div>
  </div>
</template>
