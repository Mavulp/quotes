<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js'
import { merge } from 'lodash'
import { computed } from 'vue'
import ChartBar from './ChartBar.vue'

const props = defineProps<{
  config?: ChartOptions<'bar'>
  data: ChartData<'bar'>
  height?: string
  cost?: boolean
}>()

const mergedConfig = computed(() => {
  return merge(props.config ?? {}, {
    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 5,
        },
        grid: {
          drawBorder: false,
        },
      },
    },
  } as ChartOptions<'bar'>)
})

/**
 * Histogram is a subset of bar chart.
 */
</script>

<template>
  <ChartBar :height="height" :data="data" :config="mergedConfig" :cost="props.cost" />
</template>
