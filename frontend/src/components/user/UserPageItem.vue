<script setup lang='ts'>
import { marked } from 'marked'
import { computed } from 'vue'
import { gradient } from '../../bin/color'
import { useUser } from '../../store/user'
import type { User } from '../../types/user-types'

const props = defineProps<{ user: User }>()
const user = useUser()
const index = computed(() => user.users.filter(u => !u.profilePicture).findIndex(u => u.username === props.user.username))
</script>

<template>
  <router-link v-if="props.user.username" :key="props.user.username" :to="{ name: 'RouteUserProfile', params: { username: props.user.username } }" class="quote-users-item">
    <div class="user-pfp">
      <template v-if="props.user.profilePicture">
        <img :src="props.user.profilePicture" alt=" ">
      </template>
      <div v-else :style="{ backgroundColor: gradient.at(index) }">
        {{ props.user.username.at(0) }}
      </div>
    </div>

    <strong>{{ props.user.username }}</strong>
    <template v-if="props.user.bio">
      <div class="profile-markdown-wrap" v-html="marked.parse(props.user.bio)" />
    </template>
  </router-link>
</template>
