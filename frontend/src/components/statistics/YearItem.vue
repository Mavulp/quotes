<script setup lang='ts'>
const props = defineProps<{
  data: Record<string, number>[]
}>()
</script>

<template>
  <div>
    <pre>{{ props.data }}</pre>
  </div>
</template>
