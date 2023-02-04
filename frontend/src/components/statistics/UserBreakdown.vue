<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js'
import { computed, onBeforeMount, ref, shallowRef } from 'vue'
import { gradient } from '../../bin/color'

import Line from '../charts/Line.vue'
import { get } from '../../bin/fetch'

interface StatisticsChart {
  labels: string[]
  datasets: {
    label: 'string'
    data: Array<number | null>
  }[]
}

const data = shallowRef<StatisticsChart>()
const hoveredUser = ref<string | null>(null)

onBeforeMount(async () => {
  data.value = await get<StatisticsChart>('/stats/quotee')
})

const chart = computed<ChartData<'line'> | null>(() => {
  if (!data.value)
    return null

  return {
    labels: data.value.labels,
    datasets: data.value.datasets.map((dataset, index) => {
      const color = gradient[index % gradient.length]
      const actualColor = (hoveredUser.value === dataset.label || hoveredUser.value === null) ? color : `${color}44`

      return {
        ...dataset,
        borderWidth: 2,
        spanGaps: true,
        pointStyle: false,
        borderColor: actualColor,
        backgroundColor: actualColor,
      }
    }),
  }
})

const options: ChartOptions<'line'> = {
  animation: false,
  maintainAspectRatio: false,
  normalized: true,
  datasets: {
    line: {
      pointRadius: 0,
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 5,
      },
    },
    y: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 10,
      },
    },
  },
}
</script>

<template>
  <div class="ladder-breakdown chart-breakdown">
    <span class="section-title dark">
      Quotees
    </span>
    <div v-if="chart" class="chart-wrapper">
      <Line class="chart-graph" :data="chart" :config="options" />

      <div class="chart-legend">
        <div
          v-for="author in chart.datasets"
          :key="author.label"
          class="legend-item"
          @mouseenter="hoveredUser = author.label ?? null"
          @mouseleave="hoveredUser = null"
        >
          <div class="legend-marker" :style="{ backgroundColor: String(author.borderColor) }" />
          {{ author.label }}
        </div>
      </div>
    </div>
  </div>
</template>
