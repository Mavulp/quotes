<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { ImageFragment } from '../../../../types/quote-types'

interface Props {
  data: ImageFragment
}

const props = defineProps<Props>()
</script>

<template>
  <div
    class="quote-item-content-block quote-item-image"
  >
    <!-- :class="{ 'is-highlight': props.data.highlight }" -->
    <img :src="props.data.content" alt="">
    <div class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <a :href="props.data.quotee">{{ props.data.quotee }}</a>
    </div>
  </div>
</template>
