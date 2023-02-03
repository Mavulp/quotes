<script setup lang='ts'>
import { computed } from 'vue'
import { findLast } from 'lodash'
import { useQuote } from '../../store/quote'
import { date, getKey, getVal, objectToArray, toNum } from '../../bin/utils'
import type { Quote } from '../../types/quote-types'
import { useLoading } from '../../store/loading'

import StatBreakdown from '../../components/statistics/YearBreakdown.vue'
import StatCell from '../../components/statistics/StatCell.vue'
import LadderBreakdown from '../../components/statistics/LadderBreakdown.vue'
import UserBreakdown from '../../components/statistics/UserBreakdown.vue'

const quote = useQuote()
const loading = useLoading()

/**
 * Top level metrics
 */

const totalQuotes = computed(() => quote.quotes.length)
const totalAuthors = computed(() => new Set(quote.quotes.map(q => q.author)).size)
const firstUpload = computed(() => findLast(quote.quotes, q => q.createdAt !== 0) as Quote)
const lastUpload = computed(() => quote.quotes.at(0) as Quote)
// const registeredUsers = computed(() => user.users.length)

// Rank users by how many times they were quoted
const usersByQuotes = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  for (const item of quote.indices)
    group[item.quotee] ? group[item.quotee]++ : group[item.quotee] = 1

  return group
}, {} as Record<string, number>)).sort((a, b) => getVal(a) < getVal(b) ? 1 : -1))

// Rank users by the amount of uploads
const usersByUploads = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  group[quote.author] ? group[quote.author]++ : group[quote.author] = 1
  return group
}, {} as Record<string, number>)).sort((a, b) => getVal(a) < getVal(b) ? 1 : -1))

// Most used tagts
const tagsByUsage = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  for (const tag of quote.tags)
    group[tag] ? group[tag]++ : group[tag] = 1

  return group
}, {} as Record<string, number>)).sort((a, b) => getVal(a) < getVal(b) ? 1 : -1))
</script>

<template>
  <div class="route-statistics">
    <div class="quote-container">
      <h1>Statistics</h1>

      <Spinner v-if="loading.get('quotes', 'users')" />
      <template v-else-if="quote.quotes.length > 0">
        <strong class="section-title">Top level summary</strong>
        <div class="stats-grid">
          <StatCell label="Quotes" :data="toNum(totalQuotes)" />
          <StatCell label="Quotees" :data="toNum(usersByQuotes.length)" />
          <StatCell label="Authors" :data="toNum(totalAuthors)" />
          <StatCell str label="Most Quoted" :data="Object.keys(usersByQuotes[0])[0]" />
          <StatCell str label="Most Posts" :data="Object.keys(usersByUploads[0])[0]" />
          <StatCell str label="Most Used Tag" :data="Object.keys(tagsByUsage[0])[0]" />
          <StatCell str label="First Post" :data="date.timeShort(firstUpload.createdAt)" />
          <StatCell str label="Latest Post" :data="date.timeShort(lastUpload.createdAt)" />
        </div>

        <strong class="section-title">Yearly</strong>
        <StatBreakdown />

        <strong class="section-title">Historic uploads</strong>
        <UserBreakdown :range="[firstUpload, lastUpload]" />

        <!-- <strong class="section-title">User uploads</strong> -->
      </template>
    </div>
  </div>
</template>
