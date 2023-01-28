<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFilters } from '../../store/filters'
import type { Tag } from '../../types/quote-types'

const props = defineProps<{
  data: Tag
}>()
const filters = useFilters()
const router = useRouter()
const open = ref(false)

function filterOnTag() {
  filters.setFilter('tag', [props.data.name])
  router.push({ name: 'RouteQuoteList' })
}
</script>

<template>
  <div class="tag-item" :class="{ 'is-active': open }">
    <button class="tag-item-header" @click.self="open = !open">
      <span>
        {{ props.data.name }}
      </span>

      <div class="flex-1" />

      <button class="button btn-white semiwide regular btn-small" @click="filterOnTag">
        Filter
      </button>

      <Icon :code="open ? 'e5ce' : 'e5cf'" />
    </button>

    <div v-if="open" class="tag-item-content">
      <pre>
        {{ props.data }}
      </pre>
    </div>
  </div>
</template>
