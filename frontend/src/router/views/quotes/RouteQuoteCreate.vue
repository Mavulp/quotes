<script setup lang="ts">
// import { ref, reactive, computed } from "vue"
import Tabs from "../../../components/Tabs.vue"
import { onBeforeMount } from "vue"
import { useCreate } from "../../../store/create"

import QuoteCreate from "../../../components/quotes/create/QuoteCreate.vue"
import QuotePreview from "../../../components/quotes/create/QuotePreview.vue"

const create = useCreate()

onBeforeMount(() => {
  create.reset()
})
</script>

<template>
  <div class="quote-route-create">
    <div class="quote-container">
      <div class="quote-title-wrap text">
        <h1>Add a quote</h1>

        <button class="button" v-if="create.form.blocks.size > 0" @click="create.reset()">
          Start new
        </button>
      </div>

      <Tabs :tabs="['Write', 'Preview']">
        <template #Write> <QuoteCreate /> </template>
        <template #Preview> <QuotePreview /> </template>
      </Tabs>
    </div>
  </div>
</template>
