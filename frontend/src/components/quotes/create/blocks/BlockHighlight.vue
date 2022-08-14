<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { HighlightQuoteContent } from "../../../../types/quote-types"

defineProps<{
  data: HighlightQuoteContent
  index: number
}>()
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
