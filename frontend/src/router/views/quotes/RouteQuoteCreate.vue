<script setup lang="ts">
// import { ref, reactive, computed } from "vue"
import Tabs from "../../../components/Tabs.vue"

import QuoteCreate from "../../../components/quotes/create/QuoteCreate.vue"
import QuotePreview from "../../../components/quotes/create/QuotePreview.vue"
</script>

<template>
  <div class="quote-route-create">
    <div class="quote-container">
      <h1>Add a quote</h1>

      <Tabs :tabs="['Write', 'Preview']">
        <template #Write> <QuoteCreate /> </template>
        <template #Preview> <QuotePreview /> </template>
      </Tabs>
    </div>
  </div>
</template>
