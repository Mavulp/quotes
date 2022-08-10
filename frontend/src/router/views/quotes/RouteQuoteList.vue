<script setup lang="ts">
import { ref, watch } from "vue"

import InputSelect from "../../../components/form/InputSelect.vue"
import Search from "../../../components/form/Search.vue"
import InputRadio from "../../../components/form/InputRadio.vue"
import QuoteListItem from "../../../components/quotes/quote-item/QuoteListItem.vue"

const search = ref("")

/**
 * PLACEHOLERS
 */
const options = [
  {
    value: "kilmanio",
    label: "Kilmanoi"
  },
  {
    value: "dolanske",
    label: "JANSKEPANSKE"
  },
  {
    value: "zealsprince",
    label: "ANDRUSHKLA"
  }
]

type PlainQuoteContent = {
  type: "plain"
  index: number
  text: string
}

type ImageQuoteContent = {
  type: "img"
  index: number
  url: string
}

type SubQuoteContent = {
  type: "sub-quote"
  index: number
  text: string
  author: string
}

type Quote = {
  id: number
  quotee: string
  author: string
  created: number
  votes: number
  content: Array<PlainQuoteContent | ImageQuoteContent | SubQuoteContent>
}

// const data: Quote[] = [
//   {
//     id:0,

//   }
// ]

const quotee = ref("")
const author = ref("")

/**
 * List type
 */

const expanded = ref<boolean>(localStorage.getItem("is-list-expanded") === "false" ? false : true)

watch(expanded, (value: boolean) => {
  localStorage.setItem("is-list-expanded", value.toString())
})
</script>

<template>
  <div class="quote-route-list">
    <section class="quote-list-header">
      <div class="quote-container">
        <div class="quote-title-wrap">
          <h1>Quote list</h1>
          <button class="button">Random</button>
        </div>

        <div class="quote-title-wrap">
          <Search placeholder="Search for a quote" v-model:value="search" />

          <InputSelect
            v-model:selected="quotee"
            :multiple="true"
            :options="options"
            placeholder="Filter by quotee"
            icon="e91f"
          />
          <InputSelect
            v-model:selected="author"
            :options="options"
            placeholder="Filter by author"
            icon="ea4d"
          />
        </div>
      </div>
    </section>

    <section class="quote-list">
      <div class="quote-container">
        <div class="quote-list-context">
          <p><b>479</b> quotes by <b>17</b> people</p>

          <div class="quote-list-display-switch">
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
          </div>
        </div>

        <div class="quote-list-items">
          <QuoteListItem v-for="item in 3" :key="item" :id="item" />
        </div>
      </div>
    </section>
  </div>
</template>
