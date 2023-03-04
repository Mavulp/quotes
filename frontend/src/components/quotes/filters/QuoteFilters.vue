<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEventListener, useLocalStorage } from '@vueuse/core'
import { useFilters } from '../../../store/filters'

import InputCheckbox from '../../../components/form/InputCheckbox.vue'
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

/**
 * Header scrolling
 */

const stickHeader = ref(false)

useEventListener('scroll', () => {
  stickHeader.value = window.scrollY > 256
})

function scrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="quote-filters">
    <div class="quote-filters-sticky">
      <strong>Filters</strong>

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

      <!-- <div style="width:10px" /> -->

      <hr>

      <InputCheckbox v-model:check="filters.offensive" label="Offensive Content" />

      <button v-show="filters.active" data-title-bottom="Clear Filters" class="filters-clear button btn-round btn-white" @click="filters.clear()">
        <Icon code="e5cd" size="1.8" />
      </button>
    </div>

    <Transition name="page" mode="out-in">
      <button v-if="stickHeader" data-title-top="Scroll Up" class="button btn-round btn-go-up btn-white" @click="scrollUp">
        <Icon code="e5d8" size="2" />
      </button>
    </Transition>
  </div>
</template>
