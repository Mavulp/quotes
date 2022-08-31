<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { delay } from "../../../../bin/utils"
import { useCreate } from "../../../../store/create"
import { ImageQuoteContent } from "../../../../types/quote-types"

import LoadingBar from "../../../loading/LoadingBar.vue"
import InputText from "../../../form/InputText.vue"

const formats = [
  ".jpeg",
  ".gif",
  ".png",
  ".apng",
  ".svg",
  ".bmp",
  ".bmp",
  ".ico",
  ".jpg",
  ".webp",
  ".HEIC"
]

const create = useCreate()
const props = defineProps<{
  data: ImageQuoteContent
  // FIXME: Should only use index of the map, but for some reason that went to -2 before
  // so I am using the _actual_ iteration index as well as the supposed ID of the block
  // In perfect world both would be the same
  id: number
  index: number
}>()

const inputId = computed(() => props.data.type + "-" + props.id)
const dropId = computed(() => inputId.value + "-drop")
const dragging = ref(false)
const inputEl = ref<HTMLDivElement | null>()

onMounted(() => {
  const el = document.querySelector<HTMLDivElement>("#" + dropId.value)
  inputEl.value = document.querySelector<HTMLInputElement>("#" + inputId.value)

  if (el) {
    el.addEventListener("dragenter", submit, false)
    el.addEventListener("dragleave", submit, false)
    el.addEventListener("dragover", submit, false)
    el.addEventListener("drop", submit, false)
    el.addEventListener("input", submit, false)
  }
})

/**
 * Handle Uploading
 */

const file = ref<File>()
const loading = ref(false)
const url = ref<string>()
const quotee = computed({
  get: () => props.data.quotee,
  set: (quotee) => {
    create.editBlock(props.id, {
      ...props.data,
      quotee
    })
  }
})

async function submit(e: any) {
  e.preventDefault()
  e.stopPropagation()

  file.value = e.target?.files ? e.target.files[0] : e.dataTransfer?.files[0]
  if (!file.value) return

  loading.value = true

  // TODO: Handle file upload here
  await delay(1500)

  // Create a thumbnail to show after file has been uploaded
  loading.value = false
  url.value = URL.createObjectURL(file.value)
}

// function delImage

function remove() {
  create.delBlock(props.id)
}

function manualUpload() {
  file.value = undefined
  url.value = undefined

  if (inputEl.value) {
    inputEl.value.click()
  }
}

function setHighlight() {
  create.editBlock(props.id, {
    ...props.data,
    highlight: !props.data.highlight
  })
}
</script>

<template>
  <div class="quote-block block-create-image" :class="{ 'is-loading': loading }">
    <div class="quote-buttons">
      <span class="quote-number"
        >#<b>{{ index + 1 }}</b></span
      >
      <button
        class="btn-round btn-highlight btn-hover-40"
        data-title-right="Highlight"
        @click="setHighlight"
      >
        <Icon :code="props.data.highlight ? 'e834' : 'e835'" />
      </button>

      <button
        class="btn-round btn-gray btn-hover-40"
        data-title-right="Upload"
        @click="manualUpload"
      >
        <Icon code="e43e" />
      </button>

      <button
        class="btn-round btn-gray btn-hover-40"
        data-title-right="Remove block"
        @click="remove"
      >
        <Icon code="e5cd" />
      </button>
    </div>

    <div class="image-loading" v-if="loading">
      <LoadingBar />
      <p>Uploading...</p>
    </div>

    <div class="image-preview" v-else-if="url">
      <img :src="url" alt="" />
    </div>
    <template v-else>
      <div class="form-file" :id="dropId">
        <input type="file" :id="inputId" :name="inputId" :accept="formats.join(',')" />
        <label :for="inputId" @dragenter="dragging = true" @mouseleave="dragging = false">
          <span>{{ dragging ? "Drop it!" : "Click me / Drag file onto me" }}</span>
        </label>
      </div>
    </template>
    <InputText
      class="form-quotee"
      v-if="!loading"
      v-model:value="quotee"
      placeholder="Add a quotee (optional)"
    />
  </div>
</template>
