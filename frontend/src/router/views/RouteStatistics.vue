<script setup lang='ts'>
import { computed } from 'vue'
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
const totalQuotees = computed(() => quote.quotes.reduce((amount, q) => {
  amount += new Set(q.indices.map(item => item.quotee)).size
  return amount
}, 0))
const totalAuthors = computed(() => new Set(quote.quotes.map(q => q.author)).size)
const firstUpload = computed(() => quote.quotes.at(-1) as Quote)
const lastUpload = computed(() => quote.quotes.at(0) as Quote)
const registeredUsers = computed(() => user.users.length)
// Rank users by how many times they were quoted

type Metric = Record<string, number>

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
</script>

<template>
  <div class="route-statistics">
    <div class="quote-container">
      <h1>Statistics</h1>

      <Spinner v-if="loading.get('quotes')" />
      <template v-else>
        <div class="stats-grid">
          <div class="cell">
            <strong>{{ toNum(totalQuotes) }}</strong>
            <span>Total Quotes</span>
          </div>
          <div class="cell">
            <strong>{{ toNum(totalQuotees) }}</strong>
            <span>Quoted Users</span>
          </div>
          <div class="cell">
            <strong>{{ toNum(totalAuthors) }}</strong>
            <span>Total Authors</span>
          </div>
          <div class="cell">
            <strong>{{ toNum(registeredUsers) }}</strong>
            <span>Registered Users</span>
          </div>

          <div class="cell date">
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
        <pre>{{ usersByQuotes }}</pre>
      </template>
    </div>
  </div>
</template>
