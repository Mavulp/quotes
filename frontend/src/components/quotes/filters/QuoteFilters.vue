<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useFilters } from '../../../store/filters'

import InputSelect from '../../../components/form/InputSelect.vue'
import Search from '../../../components/form/Search.vue'

const filters = useFilters()

/**
 * FILTERING
 */
const options = [
  {
    value: 'kilmanio',
    label: 'Kilmanoi',
  },
]
const search = ref('')
const quotee = ref('')
const author = ref('')
</script>

<template>
  <div class="quote-title-wrap quote-filters">
    <Search v-model:value="search" placeholder="Search for a quote" />

    <InputSelect
      v-model:selected="quotee"
      :multiple="true"
      :options="options"
      placeholder="Filter by quotee"
      icon="e91f"
    />
    <InputSelect
      v-model:selected="author"
      :options="options"
      placeholder="Filter by author"
      icon="ea4d"
    />
  </div>
</template>
