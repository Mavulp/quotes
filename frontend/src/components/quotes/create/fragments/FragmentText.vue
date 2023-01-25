<script setup lang="ts">
import { computed } from 'vue'
import { useCreate } from '../../../../store/create'
import type { TextFragment } from '../../../../types/quote-types'

import InputText from '../../../form/InputText.vue'
import FragmentButtons from '../FragmentButtons.vue'
import InputTextarea from '../../../form/InputTextarea.vue'

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
</script>

<template>
  <div
    class="quote-block block-create-context"
    tabindex="0"
  >
    <FragmentButtons
      :index="props.index"
      :highlight="props.data.highlight"
      tabindex="-1"
      @remove="remove"
    />
    <InputTextarea v-model:value="context" placeholder="Provide context for quote" />
    <InputText v-model:value="quotee" class="form-quotee" placeholder="Add a quotee (optional)" />
  </div>
</template>
