<script setup lang='ts'>
import { ref } from 'vue'
import type { RoundFillQuote } from '../../../types/game-types'

const props = defineProps<{
  round: RoundFillQuote
}>()
</script>

<template>
  <div class="game-fragment">
    <pre>{{ props.round }}</pre>
  </div>
</template>
