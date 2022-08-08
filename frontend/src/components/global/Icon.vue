<script setup lang="ts">
import { computed } from "vue";

const { code, size = "1rem" } = defineProps<{
  code: String;
  size?: String;
}>();

// const content = computed(() => `&#x${props.code};`)
const formatSize = computed(() => `${size}rem`);
</script>

<template>
  <span :style="{ fontSize: formatSize }" class="material-icons">{{ code }}</span>
</template>
