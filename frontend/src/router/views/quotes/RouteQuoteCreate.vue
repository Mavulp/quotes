<script setup lang="ts">
// import { ref, reactive, computed } from "vue"
import { onBeforeMount } from 'vue'
import Tabs from '../../../components/Tabs.vue'
import { useCreate } from '../../../store/create'

import QuoteCreate from '../../../components/quotes/create/QuoteCreate.vue'
import QuotePreview from '../../../components/quotes/create/QuotePreview.vue'

const create = useCreate()
</script>

<template>
  <div class="quote-route-create">
    <div class="quote-container">
      <div class="quote-title-wrap text">
        <h1>Add a quote</h1>

        <Transition name="fade" mode="out-in">
          <button v-show="create.form.fragments.length > 0" class="button" @click="create.reset()">
            Start new
          </button>
        </Transition>
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
