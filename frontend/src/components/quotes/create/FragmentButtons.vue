<script setup lang="ts">
import { useCreate } from '../../../store/create'

defineProps<Props>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'dragstatus', isDragging: boolean): void
}>()

const create = useCreate()

interface Props {
  index: number
}
</script>

<template>
  <div class="quote-buttons">
    <span class="quote-number">#<b>{{ index + 1 }}</b></span>
    <button
      v-if="create.form.fragments.length > 1"
      class="btn-round btn-highlight btn-hover-40"
      data-title-right="Re-arrange"
      @mousedown="create.setDragIndex(index)"
      @mouseleave="create.setDragIndex(null)"
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
