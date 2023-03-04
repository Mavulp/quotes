<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useEventListener, useLocalStorage } from '@vueuse/core'
import dayjs from 'dayjs'
import VueDatePicker from '@vuepic/vue-datepicker'
import { useFilters } from '../../../store/filters'

import InputCheckbox from '../../../components/form/InputCheckbox.vue'
import InputSelect from '../../../components/form/InputSelect.vue'
import Search from '../../../components/form/Search.vue'
import { displayDateShort } from '../../../bin/time'

const filters = useFilters()

/**
 * FILTERING
 */
const quoteeOptions = computed(() => filters.getOptionsByKey('quotee'))
const authorOptions = computed(() => filters.getOptionsByKey('author'))

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

const excludedTags = computed({
  get: () => filters.getFiltersByKey('excludedTags'),
  set: (value: string[]) => {
    localStorage.setItem('quotes_excluded_tags', JSON.stringify(value))
    filters.setFilter('excludedTags', value)
  },
})

const date = computed({
  get() {
    const { from, to } = filters.date
    return [from, to]
  },
  set([from, to]) {
    filters.$patch({
      date: {
        from: dayjs(from).valueOf(),
        to: dayjs(to).valueOf(),
      },
    })
  },
})

const search = computed({
  get: () => filters.search,
  set: value => filters.setSearch(value),
})

const tagOptions = computed(() => {
  const options = filters.getOptionsByKey('tag')
  if (excludedTags.value.length === 0)
    return options
  return options.filter(option => !excludedTags.value.includes(option.value))
})

const excludedTagOptions = computed(() => {
  const options = filters.getOptionsByKey('tag')
  if (tag.value.length === 0)
    return options
  return options.filter(option => !tag.value.includes(option.value))
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

// Reset date range
function resetDateRange() {
  filters.$patch({
    date: {
      from: 0,
      to: Date.now(),
    },
  })
}
</script>

<template>
  <div class="quote-filters">
    <div class="quote-filters-sticky">
      <div class="filters-title">
        <strong>Filters</strong>
        <button v-show="filters.active" class="button btn-white" @click="filters.clear()">
          Clear
          <Icon code="e5cd" size="1.8" />
        </button>
      </div>
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
      <hr>
      <div>
        <div class="filters-title date">
          <strong>Date</strong>
          <button class="button btn-white" @click="resetDateRange">
            Reset
          </button>
        </div>

        <VueDatePicker
          v-model="date"
          range
          utc
          auto-apply
          hide-input-icon
          position="center"
          dark
          :enable-time-picker="false"
        >
          <template #trigger>
            <button class="date-picker">
              <span>
                <Icon code="e8df" size="1.8" />
                {{ dayjs(filters.date.from).format(displayDateShort) }}
              </span>
              -
              <span>
                <Icon code="e8df" size="1.8" />
                {{ dayjs(filters.date.to).format(displayDateShort) }}
              </span>
            </button>
          </template>
        </VueDatePicker>
      </div>
      <hr>
      <strong>Tags</strong>
      <div class="filters-between">
        <InputSelect
          v-model:selected="tag"
          :options="tagOptions"
          placeholder="Include"
          icon="e892"
          multiple
          :cantclear="false"
        />

        <InputSelect
          v-model:selected="excludedTags"
          :options="excludedTagOptions"
          placeholder="Exclude"
          icon="e9b6"
          multiple
          :cantclear="false"
        />
      </div>
      <hr>
      <InputCheckbox v-model:check="filters.offensive" label="Show Offensive Content" />
    </div>
    <Transition name="page" mode="out-in">
      <button v-if="stickHeader" data-title-top="Scroll Up" class="button btn-round btn-go-up btn-white" @click="scrollUp">
        <Icon code="e5d8" size="2" />
      </button>
    </Transition>
  </div>
</template>
