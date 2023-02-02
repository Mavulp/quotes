<script setup lang='ts'>
const props = defineProps<{
  label: string
  data: any
  str?: boolean
}>()
</script>

<template>
  <div class="cell" :class="{ date: props.str }">
    <strong>{{ props.data }}</strong>
    <span>{{ props.label }}</span>
  </div>
</template>
