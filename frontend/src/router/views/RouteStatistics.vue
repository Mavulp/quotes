<script setup lang='ts'>
import { computed, ref } from 'vue'
import { findLast } from 'lodash'
import { useQuote } from '../../store/quote'
import { date, getKey, getVal, objectToArray, toNum } from '../../bin/utils'
import type { Quote } from '../../types/quote-types'
import { useLoading } from '../../store/loading'
import Tabs from '../../components/Tabs.vue'

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

// Most quoted and most uploaded
const mostQuoted = computed(() => Object.keys(usersByQuotes.value[0])[0])
const mostAuthored = computed(() => Object.keys(usersByUploads.value[0])[0])

// Most used tagts
const tagsByUsage = computed(() => objectToArray(quote.quotes.reduce((group, quote) => {
  for (const tag of quote.tags)
    group[tag] ? group[tag]++ : group[tag] = 1

  return group
}, {} as Record<string, number>)).sort((a, b) => getVal(a) < getVal(b) ? 1 : -1))

// Tabs
const tab = ref('Summary')
</script>

<template>
  <div class="route-statistics">
    <div class="quote-container">
      <h1>Statistics</h1>
      <Spinner v-if="loading.get('quotes', 'users')" />
      <Tabs v-else v-model="tab" :tabs="['Summary', 'Range']" />
    </div>

    <template v-if="quote.quotes.length > 0">
      <div v-show="tab === 'Summary'" class="quote-container">
        <div class="stats-grid">
          <StatCell label="Quotes" :data="toNum(totalQuotes)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell label="Quotees" :data="toNum(usersByQuotes.length)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell label="Authors" :data="toNum(totalAuthors)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell
            str label="Most Quoted" :data="mostQuoted"
            :to="{ name: 'RouteUserProfile', params: { username: mostQuoted } }"
          />
          <StatCell
            str label="Most Posts" :data="mostAuthored"
            :to="{ name: 'RouteUserProfile', params: { username: mostAuthored } }"
          />
          <StatCell
            str label="Most Used Tag" :data="Object.keys(tagsByUsage[0])[0]"
            :to="{ name: 'RouteTags' }"
          />
          <StatCell
            str label="First Post" :data="date.timeShort(firstUpload.createdAt)"
            :to="{ name: 'RouteQuoteDetail', params: { id: firstUpload.id } }"
          />
          <StatCell
            str label="Latest Post" :data="date.timeShort(lastUpload.createdAt)"
            :to="{ name: 'RouteQuoteDetail', params: { id: lastUpload.id } }"
          />
        </div>

        <StatBreakdown />
      </div>
      <div v-show="tab === 'Range'" class="quote-container container-header">
        <UserBreakdown />
      </div>
    </template>
  </div>
</template>
