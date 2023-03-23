<script setup lang='ts'>
import { isNil } from 'lodash'
import { computed } from 'vue'
import { getRndGradient } from '../../bin/color'
import { useUser } from '../../store/user'
import type { Player } from '../../types/game-types'

const props = defineProps<{
  player: Player
  difference?: number
}>()

const users = useUser()
const user = computed(() => users.users.find(u => u.username === props.player.username))
</script>

<template>
  <div v-if="user" class="game-user">
    <div class="image-wrap">
      <img v-if="user.profilePicture" :src="user.profilePicture">
      <div v-else :style="{ backgroundColor: getRndGradient() }">
        {{ user.username[0] }}
      </div>
    </div>

    <div class="game-context">
      <span>{{ user.username }}</span>
      <slot />
    </div>

    <strong>
      {{ props.player.score }}
    </strong>
    <span
      v-if="!isNil(props.difference)"
      class="tag small"
      :class="[props.difference === 0 ? 'red' : 'green']"
    >
      +{{ props.difference }}
    </span>
  </div>
</template>
