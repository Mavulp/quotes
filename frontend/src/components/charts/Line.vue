<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { merge } from 'lodash'
import { computed } from 'vue'
import { useCssVar } from '@vueuse/core'

interface Props {
  data: ChartData<'line'>
  config?: ChartOptions<'line'>
  cost?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
})

const defaultConfig: ChartOptions<'line'> = {
  scales: {
    x: {
      grid: {
        color: useCssVar('--color-border-light').value,
      },
    },
    y: {
      grid: {
        color: useCssVar('--color-border-light').value,
      },
    },
  },
}

const mergedOptions = computed(() => {
  return merge(
    defaultConfig,
    props.config,
  )
})
</script>

<template>
  <div class="graph-wrapper">
    <Line ref="chart" :data="props.data" :options="mergedOptions" />
  </div>
</template>
