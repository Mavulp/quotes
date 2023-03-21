<script setup lang='ts'>
import { useGame } from '../../store/game'

const game = useGame()
</script>

<template>
  <div class="quote-container-small game-end-modal">
    <div class="modal-content">
      <h3>That's a wrap!</h3>

      <pre>
        {{ game.state }}
      </pre>
    </div>
  </div>
</template>
