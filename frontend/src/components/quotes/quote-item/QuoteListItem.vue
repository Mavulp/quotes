<script setup lang="ts">
import { Quote } from "../../../types/quote-types"
import { date } from "../../../bin/utils"
import { computed } from "vue"

import QuoteModelHighlight from "./quote-item-models/QuoteModelHighlight.vue"
import QuoteModelContext from "./quote-item-models/QuoteModelContext.vue"
import QuoteModelImage from "./quote-item-models/QuoteModelImage.vue"
import QuoteItemInteract from "./QuoteItemInteract.vue"

interface Props {
  data: Quote
}

const props = defineProps<Props>()

/**
 * User display
 */

const USER_THRESHOLD = 3
const highlightUsers = computed(() => props.data.quotees.slice(0, USER_THRESHOLD))
const otherUsers = computed(() =>
  props.data.quotees
    .slice(USER_THRESHOLD)
    .map((quotee) => `${quotee.username} #${quotee.index}`)
    .join(", ")
)
</script>

<template>
  <div class="quote-item">
    <div class="quote-item-header">
      <!-- TODO: quotees -->

      <div class="quote-quotees">
        <span class="quote-text quote-quotee" v-for="item in highlightUsers" :key="item.username">
          <a :href="item.username">{{ item.username }}</a> {{ `#${item.index}` }}
        </span>

        <span v-if="props.data.quotees.length > 2" :data-title-bottom="otherUsers">...</span>
      </div>

      <div class="quote-divider"></div>

      <span class="quote-text"> {{ date.simple(props.data.createdAt) }} </span>

      <span class="quote-text quote-author">
        reported by

        <a href="/kilmanio">{{ props.data.author }}</a>
      </span>

      <div class="quote-padder"></div>

      <QuoteItemInteract :id="props.data.id" />
    </div>

    <div class="quote-item-content">
      <template v-for="item in props.data.blocks" :key="item.index">
        <QuoteModelHighlight v-if="item.type === 'highlight'" :data="item" />
        <QuoteModelContext v-else-if="item.type === 'context'" :data="item" />
        <QuoteModelImage v-else-if="item.type === 'image'" :data="item" />
      </template>
    </div>
  </div>
</template>
