<script setup lang="ts">
import { computed, onBeforeMount, provide, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Quote, Quotee } from '../../../types/quote-types'
import { date } from '../../../bin/utils'

import { useUser } from '../../../store/user'
import { get } from '../../../bin/fetch'
import type { Comment } from '../../../types/comment-types'
import ModelFragmentText from './fragments/ModelFragmentText.vue'
import ModelFragmentHighlight from './fragments/ModelFragmentHighlight.vue'
import ModelFragmentImage from './fragments/ModelFragmentImage.vue'

interface Props {
  data: Quote
}

const props = defineProps<Props>()
const router = useRouter()

/**
 * User display
 */

const USER_THRESHOLD = 3
const highlightUsers = computed<Quotee[]>(() => props.data.indices.slice(0, USER_THRESHOLD))

const otherUsers = computed(() =>
  props.data.indices
    .slice(USER_THRESHOLD)
    .map(user => `${user.quotee} #${user.index}`)
    .join(', '),
)

provide(
  'quote',
  computed<Quote>(() => props.data),
)

function goToQuote(e?: Event) {
  if (e)
    e.preventDefault()
  router.push({ name: 'RouteQuoteDetail', params: { id: props.data.id } })
}

// Comment count
const commentCount = ref(0)
onBeforeMount(async () => {
  const comments = await get<Comment[]>(`/quote/${props.data.id}/comment`)

  commentCount.value = comments.length
})
</script>

<template>
  <div :id="props.data.id.toString()" class="quote-item" :class="{ 'is-offensive': props.data.offensive }">
    <div class="quote-item-header" @click.self="goToQuote()">
      <div class="quote-quotees">
        <span v-for="user in highlightUsers" :key="user.quotee" class="quote-text quote-quotee">
          <router-link :to="{ name: 'RouteUserProfile', params: { username: user.quotee } }">{{ user.quotee }}</router-link>
          {{ `#${user.index}` }}
        </span>

        <span v-if="otherUsers.length > 0" :data-title-bottom="otherUsers">...</span>
      </div>

      <div class="quote-divider" />

      <span class="quote-text quote-author">
        reported by
        <router-link :to="{ name: 'RouteUserProfile', params: { username: props.data.author } }">{{ props.data.author }}</router-link>
      </span>
      <div class="quote-padder" />

      <template v-if="commentCount > 0">
        <span class="quote-text quote-comments">
          {{ commentCount }}
          <Icon code="e0cb" size="1.5" />
        </span>
        <div class="quote-divider" />
      </template>
      <span class="quote-text"> {{ date.simple(props.data.createdAt) }} </span>
    </div>

    <router-link
      :to="{ name: 'RouteQuoteDetail', params: { id: props.data.id } }"
      class="quote-item-content"
      role="button"
    >
      <template v-for="item in props.data.fragments" :key="item.index">
        <ModelFragmentText
          v-if="item.type === 'text' && !item.highlight"
          :data="item"
        />
        <ModelFragmentHighlight
          v-if="item.type === 'text' && item.highlight"
          :data="item"
        />
        <ModelFragmentImage
          v-else-if="item.type === 'image'"
          :class="{ 'is-highlight': item.highlight }"
          :data="item"
        />
      </template>
    </router-link>

    <span v-if="props.data.fragments.length > 1" class="parts">{{ props.data.fragments.length - 1 }} more parts...</span>
  </div>
</template>
