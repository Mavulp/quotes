<script setup lang='ts'>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { date } from '../../bin/utils'
import { useFilters } from '../../store/filters'
import { useQuote } from '../../store/quote'
import type { Tag } from '../../types/quote-types'

const props = defineProps<{
  data: Tag
}>()
const filters = useFilters()
const router = useRouter()
const open = ref(false)
const quote = useQuote()

function filterOnTag() {
  filters.setFilter('tag', [props.data.name])
  router.push({ name: 'RouteQuoteList' })
}

const quotes = computed(() => {
  return quote.quotes
    .filter(q => q.tags.includes(props.data.name))
    .sort((a, b) => a.createdAt - b.createdAt)
})
</script>

<template>
  <div>
    <div class="tag-item" :class="{ 'is-active': open }">
      <button class="tag-item-header" @click.self="open = !open">
        <span>
          {{ props.data.name }}
        </span>

        <div class="flex-1" />

        <button class="button btn-white wide regular btn-small" @click="filterOnTag">
          Show Quotes
        </button>

        <!-- <Icon :code="open ? 'e5ce' : 'e5cf'" /> -->
      </button>

      <div v-show="open" class="tag-item-content">
        <div class="cell">
          <strong>Quotes</strong>
          <span>{{ quotes.length }}</span>
        </div>
        <div class="cell">
          <strong>Last Upload</strong>
          <span>{{ date.simple(quotes[0].createdAt) }}</span>
        </div>

        <div class="cell flex-1">
          <strong>Description</strong>
          <p>
            {{ props.data.description ?? 'No description.' }}
          </p>
        </div>

        <div class="cell flex">
          <button class="button btn-round btn-white">
            <Icon code="e3c9" size="2" />
          </button>
          <button class="button btn-round btn-white">
            <Icon code="e14c" size="2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
