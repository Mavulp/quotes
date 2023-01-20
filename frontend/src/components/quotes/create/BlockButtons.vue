<script setup lang="ts">
interface Props {
  index: number
  highlight?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'highlight'): void
  (e: 'startdrag', event: any): void
}>()
</script>

<template>
  <div class="quote-buttons">
    <span class="quote-number">#<b>{{ index + 1 }}</b></span>
    <button
      v-if="highlight
      "
      class="btn-round btn-highlight btn-hover-40"
      data-title-right="Highlight"
      @click="emit('highlight')"
    >
      <Icon :code="highlight ? 'e838' : 'e83a'" />
    </button>

    <button
      class="btn-round btn-highlight btn-hover-40"
      data-title-right="Re-arrange"
      @click="emit('startdrag', $event)"
    >
      <Icon code="e945" />
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
