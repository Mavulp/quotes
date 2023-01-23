<script setup lang="ts">
import { computed } from 'vue'
import { useFilters } from '../../../store/filters'

import InputSelect from '../../../components/form/InputSelect.vue'
import Search from '../../../components/form/Search.vue'

// const props = defineProps<{
//   search: string
//   author: string
//   quotee: string
// }>()

// const emit = defineEmits<{
//   (e: 'update:author', value: string): void
//   (e: 'update:quotee', value: string): void
// }>()

const filters = useFilters()

/**
 * FILTERING
 */
const quoteeOptions = computed(() => filters.getOptionsByKey('quotee'))
const authorOptions = computed(() => filters.getOptionsByKey('author'))
const tagOptions = computed(() => filters.getOptionsByKey('tag'))

const quotee = computed({
  get: () => filters.getFiltersByKey('quotee'),
  set: (value: string[]) => filters.setFilter('quotee', value),
})

const author = computed({
  get: () => filters.getFiltersByKey('author'),
  set: (value: string[]) => filters.setFilter('author', value),
})

const tag = computed({
  get: () => filters.getFiltersByKey('tag'),
  set: (value: string[]) => filters.setFilter('tag', value),
})

const search = computed({
  get: () => filters.search,
  set: value => filters.setSearch(value),
})
</script>

<template>
  <div :key="filters.active.toString()" class="quote-title-wrap quote-filters">
    <Search v-model:value="search" placeholder="Search for a quote" />

    <InputSelect
      v-model:selected="quotee"
      :options="quoteeOptions"
      placeholder="Filter by quotee"
      icon="e91f"
      multiple
      :cantclear="false"
    />
    <InputSelect
      v-model:selected="author"
      :options="authorOptions"
      placeholder="Filter by author"
      icon="ea4d"
      multiple
      :cantclear="false"
    />
    <InputSelect
      v-model:selected="tag"
      :options="tagOptions"
      placeholder="Filter by Tags"
      icon="e867"
      multiple
      :cantclear="false"
    />

    <button v-show="filters.active" class="filters-clear button btn-white" @click="filters.clear()">
      Clear Filters
    </button>
  </div>
</template>
