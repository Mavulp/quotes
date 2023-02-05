<script setup lang='ts'>
import { useEventListener } from '@vueuse/core'
import { onBeforeMount, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  /**
   * Defines if modal can be closed by clicking the close button, hitting escape
   * or clicking outside of the main container.
   */
  close: boolean
}>(), {
  close: true,
})

const emit = defineEmits<{ (e: 'close'): void }>()

onBeforeMount(() => {
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = 'unset'
})

useEventListener('keydown', ({ key }) => {
  if (key === 'Escape')
    tryClose()
})

function tryClose() {
  if (props.close)
    emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal" @click.self="tryClose()">
      <button v-if="props.close" class="modal-close" @click="tryClose()">
        <Icon code="e5cd" />
      </button>

      <slot @close="tryClose()" />
    </div>
  </Teleport>
</template>
