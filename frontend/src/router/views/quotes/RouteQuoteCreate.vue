<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import Tabs from '../../../components/Tabs.vue'
import { useCreate } from '../../../store/create'

import QuoteCreate from '../../../components/quotes/create/QuoteCreate.vue'
import QuotePreview from '../../../components/quotes/create/QuotePreview.vue'

const create = useCreate()

onBeforeUnmount(() => {
  if (create.editing)
    create.reset()
})
</script>

<template>
  <div class="quote-route-create">
    <div class="quote-container quote-smaller">
      <div class="quote-title-wrap text">
        <h1>{{ create.editing ? 'Editing' : 'Add' }} a quote</h1>

        <Transition name="fade" mode="out-in">
          <button v-show="create.form.fragments.length > 0" class="button" @click="create.reset()">
            {{ create.editing ? 'Cancel Edititing' : 'Clear Form' }}
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
