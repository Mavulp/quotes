<script setup lang='ts'>
import { uid } from 'chart.js/dist/helpers/helpers.core'
import { computed } from 'vue'
import { getRndGradient } from '../../bin/color'
import { useUser } from '../../store/user'
import type { Player } from '../../types/game-types'

const props = defineProps<{ player: Player }>()

const users = useUser()
const user = computed(() => users.users.find(u => u.username === props.player.username))
</script>

<template>
  <div v-if="user" class="game-user in-game">
    <div class="image-wrap">
      <img v-if="user.profilePicture" :src="user.profilePicture">
      <div v-else :style="{ backgroundColor: getRndGradient() }">
        {{ user.username[0] }}
      </div>
    </div>

    <span>{{ user.username }}</span>

    <strong>{{ props.player.score }}</strong>
  </div>
</template>
