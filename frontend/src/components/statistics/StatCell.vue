<script setup lang='ts'>
import type { RouteLocation, RouteLocationRaw, RouterLinkProps } from 'vue-router'

const props = defineProps<{
  label: string
  data: any
  str?: boolean
  to?: RouteLocationRaw
}>()
</script>

<template>
  <component :is="props.to ? 'router-link' : 'div'" class="cell" :class="{ date: props.str }" :to="props.to ?? {}">
    <strong>{{ props.data }}</strong>
    <span>{{ props.label }}</span>
  </component>
</template>
