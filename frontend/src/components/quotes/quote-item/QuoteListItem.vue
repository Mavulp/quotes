<script setup lang="ts">
import { computed, provide } from 'vue'
import { useRouter } from 'vue-router'
import type { Quote, Quotee } from '../../../types/quote-types'
import { date } from '../../../bin/utils'

import { useUser } from '../../../store/user'
import ModelFragmentText from './fragments/ModelFragmentText.vue'
import ModelFragmentHighlight from './fragments/ModelFragmentHighlight.vue'
import ModelFragmentImage from './fragments/ModelFragmentImage.vue'

interface Props {
  data: Quote
}

const props = defineProps<Props>()
const users = useUser()
const router = useRouter()

/**
 * User display
 */

const USER_THRESHOLD = 3
const highlightUsers = computed<Quotee[]>(() => props.data.indices.slice(0, USER_THRESHOLD))

const otherUsers = computed(() =>
  highlightUsers.value
    .slice(USER_THRESHOLD)
    .map(user => `${user.quotee} #${user.index}`)
    .join(', '),
)

provide(
  'quote',
  computed<Quote>(() => props.data),
)

function goToQuote() {
  router.push({ name: 'RouteQuoteDetail', params: { id: props.data.id } })
}
</script>

<template>
  <div :id="props.data.id.toString()" class="quote-item">
    <div class="quote-item-header" @click.self="goToQuote()">
      <div class="quote-quotees">
        <span v-for="user in highlightUsers" :key="user.quotee" class="quote-text quote-quotee">
          <router-link :to="{ name: 'RouteUserProfile', params: { username: user.quotee } }">{{ users.getUsername(user.quotee) }}</router-link>
          {{ `#${user.index}` }}
        </span>

        <span v-if="highlightUsers.length > 2" :data-title-bottom="otherUsers">...</span>
      </div>

      <div class="quote-divider" />

      <span class="quote-text quote-author">
        reported by
        <router-link :to="{ name: 'RouteUserProfile', params: { username: props.data.author } }">{{ props.data.author }}</router-link>
      </span>
      <div class="quote-padder" />
      <span class="quote-text"> {{ date.simple(props.data.createdAt) }} </span>
      <!-- <div class="quote-divider" /> -->
      <!-- <QuoteItemInteract :id="props.data.id" /> -->
    </div>

    <button class="quote-item-content" @click.self="goToQuote()">
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
    </button>
  </div>
</template>
