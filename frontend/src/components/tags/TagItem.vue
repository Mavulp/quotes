<script setup lang='ts'>
import { ref } from 'vue'
import type { Tag } from '../../types/quote-types'

const props = defineProps<{
  data: Tag
}>()

const open = ref(false)
</script>

<template>
  <div class="tag-item" :class="{ 'is-active': open }">
    <button class="tag-item-header" @click="open = !open">
      <span>
        {{ props.data.name }}
      </span>

      <Icon :code="open ? 'e5ce' : 'e5cf'" />
    </button>

    <div v-if="open" class="tag-item-content">
      <p />
      <pre>
        {{ props.data }}
      </pre>
    </div>
  </div>
</template>
