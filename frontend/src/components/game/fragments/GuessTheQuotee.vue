<script setup lang='ts'>
import { ref } from 'vue'
import type { RoundGuessQuotee } from '../../../types/game-types'

const props = defineProps<{
  round: RoundGuessQuotee
}>()
</script>

<template>
  <div class="game-fragment">
    <pre>{{ props.round }}</pre>
  </div>
</template>
