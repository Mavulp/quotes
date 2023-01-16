<script setup lang="ts">
// import { ref, reactive, computed } from "vue"
import { onBeforeMount } from 'vue'
import Tabs from '../../../components/Tabs.vue'
import { useCreate } from '../../../store/create'

import QuoteCreate from '../../../components/quotes/create/QuoteCreate.vue'
import QuotePreview from '../../../components/quotes/create/QuotePreview.vue'

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

        <button v-if="create.form.fragments.size > 0" class="button" @click="create.reset()">
          Start new
        </button>
      </div>

      <Tabs :tabs="['Create', 'Preview']">
        <template #Create>
          <QuoteCreate />
        </template>
        <template #Preview>
          <QuotePreview />
        </template>
      </Tabs>
    </div>
  </div>
</template>
