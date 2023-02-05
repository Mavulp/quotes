<script setup lang="ts">
import { LOADIPHLPAPI } from 'dns'
import { computed, ref, watch } from 'vue'
import { useEventListener, useMouse } from '@vueuse/core'
import { isNil } from 'lodash'
import { useCreate } from '../../../../store/create'
import type { TextFragment } from '../../../../types/quote-types'

import InputText from '../../../form/InputText.vue'
import FragmentButtons from '../FragmentButtons.vue'
import InputTextarea from '../../../form/InputTextarea.vue'
import FragmentQuotee from '../FragmentQuotee.vue'

const props = defineProps<{
  data: TextFragment
  index: number
}>()

const create = useCreate()

/**
 * Form fields
 */

const quotee = computed({
  get: () => props.data.quotee,
  set: (quotee) => {
    create.editFragment(props.index, {
      ...props.data,
      quotee,
    })
  },
})

const context = computed({
  get: () => props.data.content,
  set: (content) => {
    create.editFragment(props.index, {
      ...props.data,
      content,
    })
  },
})

/**
 * Form functionality
 */

function remove() {
  create.delFragment(props.index)
}

/**
 * Drag & Drop
 */
const isDragging = computed(() => !isNil(create.dragIndex))
const isDraggingOver = ref(false)

function drop() {
  isDraggingOver.value = false

  if (props.index !== create.dragIndex && !isNil(create.dragIndex)) {
    // We push item at dragIndex into the array at props index

    const itemAtDragIndex = create.form.fragments.at(create.dragIndex)

    if (!itemAtDragIndex)
      return

    // Remove item at drag index from the array
    create.form.fragments.splice(create.dragIndex, 1)
    // Append it at the drop index
    create.form.fragments.splice(props.index, 0, itemAtDragIndex)

    create.setDragIndex(null)
  }
}

function dragStart(event: DragEvent) {
  event.dataTransfer?.setData('text/plain', '')
}

function dragLeave(e: DragEvent) {
  e.preventDefault()
  isDraggingOver.value = false
}

function dragEnter(e: DragEvent) {
  e.preventDefault()
  isDraggingOver.value = true
}
</script>

<template>
  <div
    class="quote-block block-create-context"
    :class="{ 'is-dragging-over': isDraggingOver }"
    :draggable="isDragging"
    @dragstart="dragStart"
    @drop="drop"
    @dragenter="dragEnter"
    @dragleave="dragLeave"
    @dragover="dragEnter"
  >
    <FragmentButtons
      :index="props.index"
      :highlight="props.data.highlight"
      @remove="remove"
      @dragstatus="(state) => isDragging = state"
    />
    <InputTextarea v-model="context" placeholder="Provide context for quote" />
    <FragmentQuotee v-model="quotee" />
    <!-- <InputText v-model:value="quotee" class="form-quotee" placeholder="Add a quotee (optional)" /> -->
  </div>
</template>
