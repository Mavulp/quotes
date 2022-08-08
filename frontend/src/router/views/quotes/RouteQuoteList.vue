<script setup lang="ts">
import InputSelect from "../../../components/form/InputSelect.vue"
import InputText from "../../../components/form/InputText.vue"
import InputTextarea from "../../../components/form/InputTextarea.vue"
import Search from "../../../components/form/Search.vue"

import { ref } from "vue"

const search = ref("")

const options = [
  {
    value: "kilmanio",
    label: "Kilmanoi"
  },
  {
    value: "dolanske",
    label: "JANSKEPANSKE"
  },
  {
    value: "zealsprince",
    label: "ANDRUSHKLA"
  }
]

const quotee = ref("")
const author = ref("")
</script>

<template>
  <div class="quote-route-list">
    <div class="quote-list-header">
      <div class="quote-container">
        <div class="quote-title-wrap">
          <h1>Quote list</h1>
          <button class="button">Random</button>
        </div>

        <div class="quote-title-wrap">
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
      </div>
    </div>
  </div>
</template>
