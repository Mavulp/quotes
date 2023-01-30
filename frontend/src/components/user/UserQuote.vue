<script setup lang='ts'>
import { orderBy } from 'lodash'
import { computed } from 'vue'
import type { Quote } from '../../types/quote-types'
import ModelFragmentImage from '../quotes/quote-item/fragments/ModelFragmentImage.vue'

const props = defineProps<{
  data: Quote
}>()

const content = computed(() => {
  return orderBy(props.data.fragments, ['type', 'highlight'], ['desc', 'desc'])[0]
})
</script>

<template>
  <div class="quote-user">
    {{ content }}
  </div>
</template>
