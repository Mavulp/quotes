<script setup lang='ts'>
import { computed, ref } from 'vue'
import { getRndGradient } from '../../bin/color'
import { useGame } from '../../store/game'
import { useUser } from '../../store/user'

const props = defineProps<{ username: string }>()
const users = useUser()
const game = useGame()

const user = computed(() => users.users.find(u => u.username === props.username))
const isAdmin = computed(() => props.username === game.state.admin)
</script>

<template>
  <div v-if="user" class="game-user" :class="{ 'is-admin': isAdmin }">
    <div class="image-wrap">
      <img v-if="user.profilePicture" :src="user.profilePicture">
      <div v-else :style="{ backgroundColor: getRndGradient() }">
        {{ user.username[0] }}
      </div>
    </div>

    <span>
      {{ user.username }}
      &nbsp;
      <div v-if="isAdmin" class="tag highlight">Admin</div>
    </span>

    <!-- Display admin controls on all users only for admin & and not on admin themselves -->
    <div v-if="users.username === game.state.admin && props.username !== users.username" class="user-attrs">
      <button class="button btn-gray btn-round" data-title-top="Kick user" @click="game.removePlayer(props.username)">
        <Icon code="ef66" size="2" />
      </button>

      <button class="button btn-gray btn-round" data-title-top="Make Admin" @click="game.state.admin = props.username">
        <Icon code="ea3d" size="2" />
      </button>
    </div>
  </div>
</template>
