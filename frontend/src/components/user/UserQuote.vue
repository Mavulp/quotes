<script setup lang='ts'>
import { orderBy } from 'lodash'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { date } from '../../bin/utils'
import type { Quote } from '../../types/quote-types'

const props = defineProps<{
  data: Quote
}>()

const route = useRoute()

const fragment = computed(() => {
  return orderBy(props.data.fragments, ['type', 'highlight'], ['desc', 'desc'])
    .sort(a => a.quotee === route.params.username ? -1 : 1)[0]
})
</script>

<template>
  <router-link
    :to="{ name: 'RouteQuoteDetail', params: { id: props.data.id } }"
    class="quote-user"
    :class="{ 'is-highlight': fragment.highlight, 'is-offensive': props.data.offensive }"
  >
    <div class="quote-info">
      <span>{{ props.data.indices.length }} {{ props.data.indices.length === 1 ? 'quotee' : 'quotees' }}</span>
      <!-- <div class="dot-padder" /> -->
      <div class="flex-1" />
      <template v-if="props.data.tags.length > 0">
        <span v-for="tag in props.data.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
        <div class="dot-padder" />
      </template>
      <span>{{ date.tiny(props.data.createdAt) }}</span>
    </div>

    <img v-if="fragment.type === 'image'" :src="fragment.content" alt="Idk an image of some sort">
    <template v-else>
      {{ fragment.content }}
    </template>
  </router-link>
</template>
