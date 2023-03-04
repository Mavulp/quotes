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
// import LadderBreakdown from '../../components/statistics/LadderBreakdown.vue'
import QuoteeBreakdown from '../../components/statistics/QuoteeBreakdown.vue'
import AuthorBreakdown from '../../components/statistics/AuthorBreakdown.vue'
import UserBreakdown from '../../components/statistics/UserBreakdown.vue'
import { useUser } from '../../store/user'

const quote = useQuote()
const user = useUser()
const loading = useLoading()

/**
 * Top level metrics
 */

const totalQuotes = computed(() => quote.quotes.length)
const offensiveQuotes = computed(() => quote.quotes.filter(q => q.offensive).length)

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
    <section class="quote-page-header">
      <div class="quote-container quote-smaller">
        <h1>Statistics</h1>
        <Spinner v-if="loading.get('quotes', 'users')" />
        <Tabs v-else v-model="tab" :tabs="['Summary', 'Quotees', 'Authors', 'Users']" />
      </div>
    </section>

    <template v-if="quote.quotes.length > 0 && user.users.length > 0">
      <div v-show="tab === 'Summary'" class="quote-container quote-smaller">
        <div class="stats-grid">
          <StatCell label="Quotes" :data="toNum(totalQuotes)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell label="Offensive quotes" :data="toNum(offensiveQuotes)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell label="Safe quotes" :data="toNum(totalQuotes - offensiveQuotes)" :to="{ name: 'RouteQuoteList' }" />

          <StatCell label="Quotees" :data="toNum(usersByQuotes.length)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell label="Authors" :data="toNum(totalAuthors)" :to="{ name: 'RouteQuoteList' }" />
          <StatCell
            str label="Most quoted" :data="mostQuoted"
            :to="{ name: 'RouteUserProfile', params: { username: mostQuoted } }"
          />
          <StatCell
            str label="Most posts" :data="mostAuthored"
            :to="{ name: 'RouteUserProfile', params: { username: mostAuthored } }"
          />
          <StatCell
            str label="Most used tag" :data="Object.keys(tagsByUsage[0])[0]"
            :to="{ name: 'RouteTags' }"
          />
          <StatCell
            str label="First post" :data="date.timeShort(firstUpload.createdAt)"
            :to="{ name: 'RouteQuoteDetail', params: { id: firstUpload.id } }"
          />
          <StatCell
            str label="Latest post" :data="date.timeShort(lastUpload.createdAt)"
            :to="{ name: 'RouteQuoteDetail', params: { id: lastUpload.id } }"
          />
        </div>

        <StatBreakdown />
      </div>
      <div v-show="tab === 'Quotees'" class="quote-container">
        <QuoteeBreakdown />
      </div>
      <div v-show="tab === 'Authors'" class="quote-container">
        <AuthorBreakdown />
      </div>
      <UserBreakdown v-show="tab === 'Users'" />
    </template>
  </div>
</template>
