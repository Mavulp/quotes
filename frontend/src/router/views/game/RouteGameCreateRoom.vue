<script setup lang='ts'>
import { useRouter } from 'vue-router'

const router = useRouter()

function initCreateRoom() {
  // Call API endpoint to start a game session which will return the room ID

  const id = /** Some API request */ 1

  router.push({
    name: 'RouteGameSetupRoom',
    params: { id },
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
