<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useQuote } from '../../../store/quote'
import { $, toBool } from '../../../bin/utils'

// import InputRadio from "../../../components/form/InputRadio.vue"
import QuoteListItem from '../../../components/quotes/quote-item/QuoteListItem.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'
import { useLoading } from '../../../store/loading'
import { useFilters } from '../../../store/filters'

const loading = useLoading()
const quote = useQuote()
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
  const unfiltered = quote.quotes

  // #1 First filter data from active filters

  // #2 Apply searching
})
const authors = computed(() =>
  Array.from(
    quote.quotes.reduce((a, b) => {
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
</script>

<template>
  <div class="quote-route-list">
    <section id="header" class="quote-list-header">
      <div class="quote-container">
        <div class="quote-title-wrap text">
          <h1>Quote list</h1>
          <button class="button">
            Random
          </button>
        </div>
        <QuoteFilters />
      </div>
    </section>
    <!--
    <pre>
      {{ filters }}
    </pre> -->

    <!-- <section class="quote-list-header is-sticky" v-if="stickHeader">
      <div class="quote-container">
        <QuoteFilters />
      </div>
      <button class="button">Random</button>
    </section> -->

    <section class="quote-list">
      <div class="quote-container">
        <template v-if="loading.get('quote-list')">
          loading
        </template>
        <template v-else>
          <div class="quote-list-context">
            <p>
              <b>{{ data.length }}</b> {{ data.length === 1 ? "quote" : "quotes" }} by
              <b>{{ authors.length }}</b> {{ authors.length === 1 ? "person" : "people" }}
            </p>

          <!-- <div class="quote-list-display-switch">
            <span class="type-title">Render list</span>

            <InputRadio
              data-title-top="Expanded"
              group="list"
              value="true"
              v-model:check="expanded"
              icon="e3c1"
            />
            <InputRadio
              data-title-top="Consolidated"
              group="list"
              value="false"
              v-model:check="expanded"
              icon="f101"
            />
          </div> -->
          </div>

          <div class="quote-list-items">
            <QuoteListItem v-for="item in data" :key="item.id" :data="item" />
          </div>
        </template>
      </div>
    </section>
  </div>
</template>
