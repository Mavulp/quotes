<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { useFilters } from "../../../store/filters"

import InputSelect from "../../../components/form/InputSelect.vue"
import Search from "../../../components/form/Search.vue"

const filters = useFilters()

/**
 * FILTERING
 */
const options = [
  {
    value: "kilmanio",
    label: "Kilmanoi"
  }
]
const search = ref("")
const quotee = ref("")
const author = ref("")
</script>

<template>
  <div class="quote-title-wrap quote-filters">
    <Search placeholder="Search for a quote" v-model:value="search" />

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
