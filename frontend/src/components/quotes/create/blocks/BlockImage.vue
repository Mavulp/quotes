<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { ImageQuoteContent } from "../../../../types/quote-types"

defineProps<{
  data: ImageQuoteContent
  index: number
}>()
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
