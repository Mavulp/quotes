<script setup lang='ts'>
import { useGame } from '../../../store/game'

const game = useGame()
</script>

<template>
  <div>
    <pre>{{ game.state.transformedPool }}</pre>
  </div>
</template>
