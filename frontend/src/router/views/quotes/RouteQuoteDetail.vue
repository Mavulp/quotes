<script setup lang='ts'>
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Quote } from '../../../types/quote-types'
import { useQuote } from '../../../store/quote'
import ModelFragmentHighlight from '../../../components/quotes/quote-item/fragments/ModelFragmentHighlight.vue'
import ModelFragmentText from '../../../components/quotes/quote-item/fragments/ModelFragmentText.vue'
import ModelFragmentImage from '../../../components/quotes/quote-item/fragments/ModelFragmentImage.vue'

const route = useRoute()
const router = useRouter()
const quotes = useQuote()
const quote = ref<Quote>()

onBeforeMount(async () => {
  const id = route.params.id

  if (!id)
    return router.go(-1)

  quote.value = await quotes.fetchQuote(Number(id))
})

function goBack() {
  if (!quote.value)
    return

  router.push({
    name: 'RouteQuoteList',
    // hash: `#${quote.value.id}`,
  })
}

const highlightLabel = 'The Funny'
</script>

<template>
  <!-- TODO if quote is missing, redirect back or show error page -->
  <div v-if="quote" class="quote-detail">
    <div class="quote-container">
      <div class="quote-detail-top">
        <button class="button btn-gray" @click="goBack">
          <Icon code="e5c4" size="1.6" />
          Back
        </button>

        <button class="button">
          Random
        </button>

        <div class="flex-1" />

        <button class="button btn-white">
          <Icon code="e80d" size="1.6" />
          Share
        </button>
      </div>

      <div class="quote-item-content">
        <template v-for="item in quote.fragments" :key="item.index">
          <ModelFragmentText
            v-if="item.type === 'text' && !item.highlight"
            :data="item"
          />
          <ModelFragmentHighlight
            v-if="item.type === 'text' && item.highlight"
            :data-title-right="highlightLabel"
            :data="item"
          />
          <ModelFragmentImage
            v-else-if="item.type === 'image'"
            :data-title-right="item.highlight ? highlightLabel : null"
            :class="{ 'is-highlight': item.highlight }"
            :data="item"
          />
        </template>
      </div>
      <pre>{{ quote }}</pre>
    </div>
  </div>
</template>
