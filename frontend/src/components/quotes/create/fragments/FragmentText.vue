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

function setHighlight() {
  create.editFragment(props.id, {
    ...props.data,
    highlight: !props.data.highlight,
  })
}
</script>

<template>
  <div
    class="quote-block block-create-context"
    draggable="true"
    tabindex="0"
  >
    <FragmentButtons
      :index="props.index"
      :highlight="props.data.highlight"
      tabindex="-1"
      @remove="remove"
      @highlight="setHighlight"
    />
    <InputTextarea v-model:value="context" placeholder="Provide context for quote" />
    <InputText v-model:value="quotee" class="form-quotee" placeholder="Add a quotee (optional)" />
  </div>
</template>
