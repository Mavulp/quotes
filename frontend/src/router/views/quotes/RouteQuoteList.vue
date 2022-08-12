<script setup lang="ts">
import { onBeforeMount, ref, watch, computed, onMounted } from "vue"
import { useQuote } from "../../../store/quote"
import { $ } from "../../../bin/utils"

import InputRadio from "../../../components/form/InputRadio.vue"
import QuoteListItem from "../../../components/quotes/quote-item/QuoteListItem.vue"
import QuoteFilters from "../../../components/quotes/filters/QuoteFilters.vue"

const quote = useQuote()

/**
 * List type
 */

const expanded = ref<boolean>(localStorage.getItem("is-list-expanded") === "false" ? false : true)
watch(expanded, (value: boolean) => {
  localStorage.setItem("is-list-expanded", value.toString())
})

/**
 * DATA
 */

onBeforeMount(() => {
  quote.fetchQuotes()
})

const data = computed(() => quote.quotes)
const authors = computed(() =>
  Array.from(
    quote.quotes.reduce((a, b) => {
      return a.add(b.author)
    }, new Set())
  )
)

/**
 * Header scrolling
 */

const stickHeader = ref(false)

onMounted(() => {
  const header = $("#header")
  const height = header?.scrollHeight ?? 0

  window.addEventListener("scroll", () => {
    stickHeader.value = window.scrollY > height
  })
})

// onMounted(() => {
//   const options = {
//     root: null,
//     rootMargin: "0px",
//     threshold: 0.1
//   }

//   const observer = new IntersectionObserver((entries) => {
//     entries.map((entry) => {
//       stickHeader.value = !entry.isIntersecting
//     })
//   }, options)

//   const header = $("#header")

//   if (header) {
//     observer.observe(header)
//   }
// })
</script>

<template>
  <div class="quote-route-list">
    <section class="quote-list-header" id="header">
      <div class="quote-container">
        <div class="quote-title-wrap text">
          <h1>Quote list</h1>
          <button class="button">Random</button>
        </div>
        <QuoteFilters />
      </div>
    </section>

    <section class="quote-list-header is-sticky" v-if="stickHeader">
      <div class="quote-container">
        <QuoteFilters />
      </div>
      <button class="button">Random</button>
    </section>

    <section class="quote-list">
      <div class="quote-container">
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
          <QuoteListItem v-for="quote in data" :key="quote.id" :data="quote" />
        </div>
      </div>
    </section>
  </div>
</template>
