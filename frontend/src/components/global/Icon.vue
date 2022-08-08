<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  code: string
  size?: string
}>()

const content = computed(() => `&#x${props.code};`)
const formatSize = computed(() => `${props.size ?? 2.4}rem`)
</script>

<template>
  <span
    :style="{ fontSize: formatSize }"
    :key="props.code"
    class="material-icons"
    v-html="content"
  ></span>
</template>
