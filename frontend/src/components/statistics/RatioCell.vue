<script setup lang='ts'>
import { computed, ref } from 'vue'
import { gradient } from '../../bin/color'
import { percent } from '../../bin/utils'
import type { Ratio } from '../../types/statistics-types'

const props = defineProps<{ data: Ratio }>()
const total = computed(() => props.data.posted + props.data.quoted)
</script>

<template>
  <li>
    <span>{{ props.data.user }}</span>

    <div class="bar-wrap">
      <span>{{ props.data.posted }} </span>

      <div class="bar">
        <div
          class="bar-item"
          :data-title-top="`${percent(props.data.posted, total).toFixed(1)}%`"
          :style="{
            width: `${Math.round(percent(props.data.posted, total))}%`,
          }"
        />
        <div
          class="bar-item"
          :data-title-top="`${percent(props.data.quoted, total).toFixed(1)}%`"
          :style="{
            width: `${Math.round(percent(props.data.quoted, total))}%`,
            backgroundColor: gradient[2],
          }"
        />
      </div>

      <span>{{ props.data.quoted }}</span>
    </div>
  </li>
</template>
