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

/**
 * Header scrolling
 */

const stickHeader = ref(false)
const height = ref(0)

onMounted(() => {
  height.value = $('#header')?.clientHeight ?? 0
})

useEventListener('scroll', () => {
  stickHeader.value = window.scrollY > height.value
})

// Get random quote
function random() {
  const id = quote.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div :key="route.path" class="quote-route-list">
    <section id="header" class="quote-page-header">
      <div class="quote-container container-header">
        <div class="quote-title-wrap text">
          <h1>Quote list</h1>
          <button v-if="filteredData.length > 1" class="button btn-gray semiwide" @click="random()">
            Random
          </button>
        </div>
        <QuoteFilters />
      </div>
    </section>

    <section v-if="stickHeader" class="quote-page-header sticky">
      <div class="quote-container container-header">
        <QuoteFilters />
      </div>
    </section>

    <section class="quote-list">
      <div class="quote-container">
        <Spinner v-if="loading.get('quote-list')" />
        <template v-else>
          <div class="quote-list-context ">
            <p>
              <b>{{ filteredData.length }}</b> {{ filteredData.length === 1 ? "quote" : "quotes" }} posted by
              <b>{{ authors.length }}</b> {{ authors.length === 1 ? "person" : "people" }}
            </p>
          </div>

          <div class="quote-list-items">
            <QuoteListItem v-for="item in displayedData" :key="item.id" :data="item" />
          </div>
        </template>
      </div>

      <Transition name="page" mode="out-in">
        <button v-if="stickHeader" data-title-top="Scroll Up" class="button btn-round btn-go-up btn-white" @click="scrollUp">
          <Icon code="e5d8" size="2" />
        </button>
      </Transition>
    </section>
  </div>
</template>
