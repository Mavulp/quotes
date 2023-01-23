<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuote } from '../../../store/quote'
import { $, getRanMinMax, searchInStr, toBool } from '../../../bin/utils'

import InputCheckbox from '../../../components/form/InputCheckbox.vue'
import InputRadio from '../../../components/form/InputRadio.vue'
import QuoteListItem from '../../../components/quotes/quote-item/QuoteListItem.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'
import { useLoading } from '../../../store/loading'
import { useFilters } from '../../../store/filters'
import { useLocalStorage } from '../../../bin/composables'

const loading = useLoading()
const quote = useQuote()
const router = useRouter()
const route = useRoute()
const filters = useFilters()

/**
 * List type
 */

const expanded = ref<boolean>(toBool(localStorage.getItem('is-list-expanded')))
watch(expanded, (value: boolean) => {
  localStorage.setItem('is-list-expanded', value.toString())
})

/**
 * DATA
 */

onBeforeMount(() => {
  quote.fetchQuotes()
})

const data = computed(() => {
  // TODO: searchbox to only show offensive / only non-offensive / all
  // TODO: sort quotes by date

  // #1 First filter data from active filters
  const filtered = quote.quotes.filter((q) => {
    const quotees = q.indices.map(indice => indice.quotee)
    return filters.isPassingFilter('author', q.author)
      && filters.isPassingFilter('quotee', quotees)
      && filters.isPassingFilter('tag', q.tags)
  })

  // #2 Apply search string
  return filtered.filter((q) => {
    if (!filters.search || filters.search.length === 0)
      return true

    // TODO: add quotee search
    return searchInStr([
      q.author,
      ...q.fragments.map(fragment => fragment.content),
      ...q.indices.map(item => item.quotee),
    ], filters.search)
  })
})

const authors = computed(() =>
  Array.from(
    data.value.reduce((a, b) => {
      return a.add(b.author)
    }, new Set()),
  ),
)

/**
 * Header scrolling
 */

const stickHeader = ref(false)

onMounted(() => {
  const header = $('#header')
  const height = header?.scrollHeight ?? 0

  window.addEventListener('scroll', () => {
    stickHeader.value = window.scrollY > height
  })
})

// Get random quote
function random() {
  const id = quote.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}

const { value } = useLocalStorage('show-offensive-quotes', true)
</script>

<template>
  <div :key="route.path" class="quote-route-list">
    <section id="header" class="quote-list-header">
      <div class="quote-container container-header">
        <div class="quote-title-wrap text">
          <h1>Quote list</h1>
          <button v-if="data.length > 1" class="button btn-gray" @click="random()">
            Random
          </button>
        </div>
        <QuoteFilters />
      </div>
    </section>

    <section class="quote-list">
      <div class="quote-container">
        <Spinner v-if="loading.get('quote-list')" />
        <template v-else>
          <div class="quote-list-context">
            <p>
              <b>{{ data.length }}</b> {{ data.length === 1 ? "quote" : "quotes" }} uploaded by
              <b>{{ authors.length }}</b> {{ authors.length === 1 ? "person" : "people" }}
            </p>

            <div class="quote-list-display-switch">
              <!-- <InputCheckbox
                v-model:check="showOffensive"
                label="Show offensive quotes"
                reverse
              />

              <div style="width:40px;" /> -->

              <InputRadio
                v-model:check="expanded"
                data-title-top="Expanded Items"
                group="list"
                value="true"
                icon="e3c1"
              />
              <InputRadio
                v-model:check="expanded"
                data-title-top="Consolidated Items"
                group="list"
                value="false"
                icon="f101"
              />
            </div>
          </div>

          <div class="quote-list-items">
            <QuoteListItem v-for="item in data" :key="item.id" :data="item" />
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
