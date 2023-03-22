<script setup lang='ts'>
import { ref } from 'vue'
import { useGame } from '../../../store/game'
const game = useGame()
</script>

<template>
  <div class="game-end">
    <h1>GG</h1>

    <ul>
      <li>
        info about the game in the header
        <ul>
          <li>duration</li>
          <li>rounds</li>
          <li>amount of players</li>
        </ul>
      </li>
      <li>
        score (big player lsit)
      </li>
      <li>option to analyze answers</li>
      <li>
        buttons for "home", "new game with same settings (figure better name)" "new game"
      </li>
    </ul>

    <!-- <pre>
      {{ game.state }}
    </pre> -->
  </div>
</template>
