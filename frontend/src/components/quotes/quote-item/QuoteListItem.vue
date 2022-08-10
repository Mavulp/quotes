<script setup lang="ts">
import { computed } from "vue"
import QuoteItemInteract from "./QuoteItemInteract.vue"

interface Props {
  id: number
}

const props = defineProps<Props>()

/**
 * Content size
 */
const content = computed(
  () =>
    "I swear to god among us is the best game and I dont knwo what I would do without it and honestly I dont know where this is going AT all so leave me alone"
)
const contentSize = computed(() => Math.min((100 / content.value.length) * 10, 15))
</script>

<template>
  <div class="quote-item">
    <div class="quote-item-header">
      <span class="quote-text quote-quotee">
        <a href="/tmtu">tmtu</a>
        #114
      </span>

      <div class="quote-divider"></div>

      <span class="quotee-text"> 27 April, 2022 </span>

      <span class="quote-text quote-author">
        reported by

        <a href="/kilmanio">kilmanio</a>
      </span>

      <div class="quote-padder"></div>

      <QuoteItemInteract id="quote-id" />
    </div>

    <div class="quote-item-content quote-item-simple">
      <strong :style="{ fontSize: contentSize + 'rem' }">{{ content }}</strong>
    </div>
  </div>
</template>
