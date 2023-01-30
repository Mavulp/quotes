<script setup lang='ts'>
import { useEventListener } from '@vueuse/core'
import { onBeforeMount, onBeforeUnmount } from 'vue'

const emit = defineEmits<{ (e: 'close'): void }>()

onBeforeMount(() => {
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = 'unset'
})

useEventListener('keydown', ({ key }) => {
  if (key === 'Escape')
    emit('close')
})
</script>

<template>
  <Teleport to="body">
    <div class="modal" @click.self="emit('close')">
      <button class="modal-close" @click="emit('close')">
        <Icon code="e5cd" />
      </button>

      <slot @close="emit('close')" />
    </div>
  </Teleport>
</template>
