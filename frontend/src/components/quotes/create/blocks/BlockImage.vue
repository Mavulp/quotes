<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { ImageQuoteContent } from "../../../../types/quote-types"

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

const props = defineProps<{
  data: ImageQuoteContent
  index: number
}>()

const id = computed(() => props.index + "-" + props.data.type)

const file = ref<File>()
const dragging = ref(false)

onMounted(() => {
  const el = document.getElementById(id.value)
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

function submit(e: any) {
  const file = e.target?.files ?? e.dataTransfer?.files
}

// function delImage
</script>

<template>
  <div class="quote-block block-create-image">
    <span class="quote-number"
      >#<b>{{ index + 1 }}</b></span
    >

    <input type="file" :id="id" :name="id" :accept="formats.join(',')" />
    <label :for="id" @dragenter="dragging = true" @mouseleave="dragging = false">
      <span>{{ dragging ? "Drop the files!" : "Click me / Drag files over here" }}</span>
    </label>
  </div>
</template>
