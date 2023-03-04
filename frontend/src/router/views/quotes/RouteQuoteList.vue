<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventListener, useThrottleFn } from '@vueuse/core'
import { useQuote } from '../../../store/quote'
import { $, searchInStr } from '../../../bin/utils'

import QuoteListItem from '../../../components/quotes/quote-item/QuoteListItem.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'
import { useLoading } from '../../../store/loading'
import { useFilters } from '../../../store/filters'

const loading = useLoading()
const quote = useQuote()
const router = useRouter()
const route = useRoute()
const filters = useFilters()

/**
 * DATA
 */

onBeforeMount(() => {
  quote.fetchQuotes()
})

onBeforeUnmount(() => {
  filters.clear()
})

const filteredData = computed(() => {
  // #1 First filter data from active filters
  const filtered = quote.quotes.filter((q) => {
    const quotees = q.indices.map(indice => indice.quotee)

    if (!filters.offensive && q.offensive)
      return false

    return filters.isPassingFilter('author', q.author)
      && filters.isPassingFilter('quotee', quotees)
      && filters.isPassingFilter('tag', q.tags)
  })

  // #2 Apply search string
  return filtered.filter((q) => {
    if (!filters.search || filters.search.length === 0)
      return true

    return searchInStr(q.fragments.map(fragment => fragment.content), filters.search)
  })
})

const authors = computed(() =>
  Array.from(
    filteredData.value.reduce((a, b) => {
      return a.add(b.author)
    }, new Set()),
  ),
)

const displayedRows = ref(20)
const displayedData = computed(() => filteredData.value.slice(0, displayedRows.value))

useEventListener(window, 'scroll', useThrottleFn(() => {
  if (window.scrollY + window.innerHeight >= (document.body.offsetHeight - 1500))
    displayedRows.value += 20
}, 100))

// Get random quote
function random() {
  const id = quote.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}
</script>

<template>
  <div :key="route.path" class="quote-route-list">
    <div class="quote-container">
      <div class="quote-title-wrap">
        <div class="title">
          <h1>Quote list</h1>
          <button v-if="filteredData.length > 1" class="button btn-gray semiwide" @click="random()">
            Random
          </button>
        </div>

        <div class="quote-list-context">
          <p>
            <b>{{ filteredData.length }}</b> {{ filteredData.length === 1 ? "quote" : "quotes" }} posted by
            <b>{{ authors.length }}</b> {{ authors.length === 1 ? "person" : "people" }}
          </p>
        </div>
      </div>

      <section class="quote-list">
        <Spinner v-if="loading.get('quote-list')" />
        <template v-else>
          <div class="quote-list-items">
            <QuoteListItem v-for="item in displayedData" :key="item.id" :data="item" />
          </div>

          <p v-if="displayedData.length === 0 || filteredData.length === displayedData.length" class="no-more-quotes">
            That's it. No more quotes.
          </p>
        </template>
      </section>

      <QuoteFilters />
    </div>
  </div>
</template>
