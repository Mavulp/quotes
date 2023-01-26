<script setup lang='ts'>
const props = defineProps<{
  user: string
}>()
</script>

<template>
  <router-link :to="{ name: 'RouteUserProfile', params: { username: props.user } }">
    {{ props.user }}
  </router-link>
</template>
