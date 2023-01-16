<script setup lang="ts">
import { computed, provide } from 'vue'
import type { Quote, Quotee } from '../../../types/quote-types'
import { date } from '../../../bin/utils'

import QuoteModelHighlight from './quote-item-models/QuoteModelHighlight.vue'
import QuoteModelContext from './quote-item-models/QuoteModelContext.vue'
import QuoteModelImage from './quote-item-models/QuoteModelImage.vue'
import QuoteItemInteract from './QuoteItemInteract.vue'

interface Props {
  data: Quote
}

const props = defineProps<Props>()

/**
 * User display
 */

const USER_THRESHOLD = 3
const highlightUsers = computed<Quotee[]>(() => props.data.fragments.map((fragment, index) => ({
  username: fragment.quotee,
  index: index + 1,
})).slice(0, USER_THRESHOLD))

const otherUsers = computed(() =>
  highlightUsers.value
    .slice(USER_THRESHOLD)
    .map(quotee => `${quotee.username} #${quotee.index}`)
    .join(', '),
)

provide(
  'quote',
  computed<Quote>(() => props.data),
)
</script>

<template>
  <div class="quote-item">
    <div class="quote-item-header">
      <div class="quote-quotees">
        <span v-for="quotee in highlightUsers" :key="quotee.username" class="quote-text quote-quotee">
          <a :href="quotee.username">{{ quotee.username }}</a>
          {{ highlightUsers.length === 1 ? "" : `#${quotee.index}` }}
        </span>

        <span v-if="highlightUsers.length > 2" :data-title-bottom="otherUsers">...</span>
      </div>

      <div class="quote-divider" />
      <span class="quote-text"> {{ date.simple(props.data.createdAt) }} </span>
      <div class="quote-divider" />
      <span class="quote-text quote-author">
        reported by
        <a href="/kilmanio">{{ props.data.author }}</a>
      </span>
      <div class="quote-padder" />
      <QuoteItemInteract :id="props.data.id" />
    </div>

    <div class="quote-item-content">
      <template v-for="item in props.data.fragments" :key="item.index">
        <QuoteModelHighlight v-if="item.type === 'highlight'" :data="item" />
        <!-- <QuoteModelContext v-else-if="item.type === 'context'" :data="item" />
        <QuoteModelImage v-else-if="item.type === 'image'" :data="item" /> -->
      </template>
    </div>
  </div>
</template>
