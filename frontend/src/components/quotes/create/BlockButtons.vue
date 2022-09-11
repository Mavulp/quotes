<script setup lang="ts">
interface Props {
  index: number
  highlight: boolean
}

const emit = defineEmits<{
  (e: "remove"): void
  (e: "highlight"): void
}>()

defineProps<Props>()
</script>

<template>
  <div class="quote-buttons">
    <span class="quote-number"
      >#<b>{{ index + 1 }}</b></span
    >
    <button
      class="btn-round btn-highlight btn-hover-40"
      data-title-right="Highlight"
      @click="emit('highlight')"
    >
      <Icon :code="highlight ? 'e838' : 'e83a'" />
    </button>

    <slot />

    <button
      class="btn-round btn-gray btn-hover-40"
      data-title-right="Remove block"
      @click="emit('remove')"
    >
      <Icon code="e5cd" />
    </button>
  </div>
</template>
