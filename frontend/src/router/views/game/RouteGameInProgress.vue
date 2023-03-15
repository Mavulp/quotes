<script setup lang='ts'>
import { useGame } from '../../../store/game'

const game = useGame()

/**
 * 1. Round starts
 * 2. Wait for round length or until everyone's ready
 * 3. Enter transition round
 * 4. Show everyone's score and the right answer
 * 5. Reset round state and user inputs
 * 6. Increment round index
 */

/**
 * UI
 *
 * Have a wrapper (this route)
 * And a dynamic component, which is just a different fragment based on the gamemode
 */
</script>

<template>
  <div>
    <pre>{{ game.state.transformedPool }}</pre>
  </div>
</template>
