<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { ContextQuoteContent } from "../../../../types/quote-types"

defineProps<{
  data: ContextQuoteContent
  index: number
}>()
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
