<script setup lang="ts">
import { computed } from 'vue'
import { useCreate } from '../../../../store/create'
import type { TextFragment } from '../../../../types/quote-types'

import InputText from '../../../form/InputText.vue'
import FragmentButtons from '../FragmentButtons.vue'
import InputTextarea from '../../../form/InputTextarea.vue'

const props = defineProps<{
  data: TextFragment
  // FIXME: Should only use index of the map, but for some reason that went to -2 before
  // so I am using the _actual_ iteration index as well as the supposed ID of the block
  // In perfect world both would be the same
  id: number
  index: number
}>()

const create = useCreate()

/**
 * Form fields
 */

const quotee = computed({
  get: () => props.data.quotee,
  set: (quotee) => {
    create.editFragment(props.id, {
      ...props.data,
      quotee,
    })
  },
})

const context = computed({
  get: () => props.data.content,
  set: (content) => {
    create.editFragment(props.id, {
      ...props.data,
      content,
    })
  },
})

/**
 * Form functionality
 */

function remove() {
  create.delFragment(props.id)
}
</script>

<template>
  <div
    class="quote-block block-create-context block-create-highlight is-highlight"
    draggable="true"
  >
    <FragmentButtons :index="props.index" @remove="remove" />
    <InputTextarea v-model:value="context" placeholder="Provide a highlight" />
    <InputText v-model:value="quotee" class="form-quotee" placeholder="Add a quotee (optional)" />
  </div>
</template>
