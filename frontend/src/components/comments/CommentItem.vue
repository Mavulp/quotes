<script setup lang='ts'>
import { computed } from 'vue'
import type { Comment } from '../../types/comment-types'
import { formatCommentContent, formatCommentUsers, sanitize } from '../../bin/comments'
import { useUser } from '../../store/user'
import { date } from '../../bin/utils'

const props = defineProps<{
  data: Comment
}>()

const emit = defineEmits<{
  (e: 'delete', text: number): void
}>()

const users = useUser()

const content = computed(() => {
  if (!props.data.text)
    return ''

  let text = props.data.text

  text = formatCommentContent(text)
  text = formatCommentUsers(text)

  return sanitize(text)
})

const user = computed(() => users.users.find(u => u.username === props.data.author))
</script>

<template>
  <div v-if="user" class="comment-item">
    <div class="comment-header">
      <div class="image-wrap">
        <img :src="user.profilePicture">
      </div>

      <router-link :to="{ name: 'RouteUserProfile', params: { username: props.data.author } }">
        {{ user.username }}
      </router-link>

      <div class="dot-padder" />

      <span>
        {{ date.time(props.data.createdAt) }}
      </span>

      <div class="flex-1" />

      <button v-if="users.username === user.username" class="remove-comment" data-title-top="Remove Comment" @click="emit('delete', props.data.id)">
        <Icon size="1.6" code="e5cd" />
      </button>
    </div>

    <div class="comment-content">
      <p v-html="content" />
    </div>
  </div>
</template>