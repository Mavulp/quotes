<script setup lang="ts">
import { computed } from "vue"
import { HighlightQuoteContent } from "../../../../types/quote-types"
import { clamp } from "../../../../bin/utils"

interface Props {
  data: HighlightQuoteContent
}

const props = defineProps<Props>()
const contentSize = computed(() => clamp(1.5, (18 / props.data.text.length) * 10, 10))
</script>

<template>
  <div class="quote-item-content-block quote-item-highlight">
    <strong class="" :style="{ fontSize: contentSize + 'rem' }">{{ props.data.text }}</strong>

    <div class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <a :href="props.data.quotee">{{ props.data.quotee }}</a>
    </div>
  </div>
</template>
