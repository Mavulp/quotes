<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { useGame } from '../../../store/game'
import { useUser } from '../../../store/user'

const router = useRouter()
const game = useGame()
const user = useUser()

function initCreateRoom() {
  // Call API endpoint to start a game session which will return the room ID
  const gameId = /** Some API request */ '1fBA01Fz'
  game.initGameState(gameId, user.username)
  // game.addPlayer(user.username)

  router.push({
    name: 'RouteGameSetupRoom',
    params: { id: gameId },
  })
}
</script>

<template>
  <div>
    <button class="button btn-highlight btn-large" @click="initCreateRoom()">
      Create a room!
    </button>
  </div>
</template>
