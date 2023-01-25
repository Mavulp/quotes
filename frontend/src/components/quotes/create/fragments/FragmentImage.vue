<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCreate } from '../../../../store/create'
import type { ImageFragment, TextFragment } from '../../../../types/quote-types'

import InputText from '../../../form/InputText.vue'
import FragmentButtons from '../FragmentButtons.vue'
import InputTextarea from '../../../form/InputTextarea.vue'

const props = defineProps<{
  data: ImageFragment
  index: number
}>()

const create = useCreate()
const preview = ref()

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

    loadImage(content)
  },
})

/**
 * Form functionality
 */

function remove() {
  create.delFragment(props.index)
}

/**
 * Load image
 */

const hasImage = ref(false)
const loading = ref(false)

function loadImage(url: string) {
  if (!url || url.length === 0) {
    hasImage.value = false
    return
  }

  const loader = new Image(384, 384)
  loader.onload = function () {
    // Append url
    // @ts-expect-error I have no idea how to type this
    preview.value.src = this.src
    hasImage.value = true
    loading.value = false
  }

  loader.onerror = function () {
    loading.value = false
  }

  loader.src = url
  loading.value = true
}
</script>

<template>
  <div
    class="quote-block block-create-image-url"
    :class="{ 'is-highlight': props.data.highlight }"
  >
    <FragmentButtons
      :index="props.index"
      :highlight="props.data.highlight"
      @remove="remove"
    />
    <!-- <InputTextarea v-model:value="context" placeholder="Provide context for quote" /> -->
    <div class="image-preview">
      <InputText v-model:value="context" class="form-quotee image-url" placeholder="Image URL" can-clear />

      <div v-if="loading" class="image-preview-wrap">
        <Spinner v-if="loading" />
      </div>
      <div v-show="hasImage" class="image-preview-wrap">
        <img ref="preview">
      </div>
    </div>
    <InputText v-model:value="quotee" class="form-quotee" placeholder="Add a quotee (optional)" />
  </div>
</template>
