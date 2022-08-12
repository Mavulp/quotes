<script setup lang="ts">
// import { ref, reactive, computed } from "vue"
import Tabs from "../../../components/Tabs.vue"
</script>

<template>
  <div class="quote-route-create">
    <div class="quote-container">
      <h1>Add a quote</h1>

      <Tabs :tabs="['Write', 'Preview']">
        <template #Write> <p>First tab content</p> </template>
        <template #Preview> <p>Second tab content</p> </template>
      </Tabs>
    </div>
  </div>
</template>
