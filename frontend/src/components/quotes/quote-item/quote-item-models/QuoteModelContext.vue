<script setup lang="ts">
import { ContextQuoteContent } from "../../../../types/quote-types"

interface Props {
  data: ContextQuoteContent
}

const props = defineProps<Props>()
</script>

<template>
  <div class="quote-item-content-block quote-item-context">
    <strong>{{ props.data.text }}</strong>

    <div class="quote-item-quotee" v-if="props.data.quotee">
      <Icon size="1.6" code="e244" />
      <span v-if="props.data.quotee === 'Anonymous'">Anonymous</span>
      <a v-else :href="props.data.quotee">{{ props.data.quotee }}</a>
    </div>
  </div>
</template>
