<script setup lang="ts">
// import { ref, reactive, computed } from "vue"

interface Props {
  id: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="quote-item-interact">
    <button class="btn-round btn-red flag">
      <Icon code="e153" />
    </button>

    <p>12</p>
    <button class="btn-round btn-highlight upvote">
      <Icon code="e5c7" size="3.4" />
    </button>
  </div>
</template>
