<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js'
import { isEmpty } from 'lodash'
import { computed, onBeforeMount, reactive, ref } from 'vue'
import { gradient } from '../../bin/color'
import { useLoading } from '../../store/loading'
import { useStats } from '../../store/statistics'
import type { RawDataset } from '../../types/statistics-types'

import Line from '../charts/Line.vue'

const loading = useLoading()
const stats = useStats()

const hoveredUser = ref<string | null>(null)
const showingOnly = reactive<{ value: string[] }>({ value: [] })
const quotee = computed(() => stats.quotee)

onBeforeMount(() => {
  stats.fetchQuoteeStats()
})

function setShowingUsers(user?: string) {
  if (!user)
    return

  if (showingOnly.value.includes(user))
    showingOnly.value = showingOnly.value.filter(u => u !== user)
  else
    showingOnly.value.push(user)
}

const chart = computed<ChartData<'line'> | null>(() => {
  if (isEmpty(quotee.value))
    return null

  return {
    labels: quotee.value.labels,
    datasets: quotee.value.datasets.map((dataset, index) => {
      const color = gradient[index % gradient.length]
      const actualColor = (hoveredUser.value === dataset.label || hoveredUser.value === null) ? color : `${color}22`

      return {
        ...dataset as RawDataset,
        borderWidth: 3,
        spanGaps: true,
        tension: 0,
        borderColor: actualColor,
        backgroundColor: actualColor,
        hidden: showingOnly.value.length > 0 && !showingOnly.value.includes(dataset.label),
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
      pointRadius: 1,
    },
  },
  elements: {
    point: {
      radius: 1,
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
        padding: 10,
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
    <Spinner v-if="loading.get('stats-quotee')" />

    <div v-else-if="chart" class="chart-wrapper">
      <Line class="chart-graph" :data="chart" :config="options" />

      <div class="chart-legend">
        <button
          v-if="showingOnly.value.length > 0"
          class="btn-clear button btn-gray btn-small"
          data-title-right="Remove filters"
          @click="showingOnly.value = []"
        >
          <Icon code="e5cd" size="1.4" />
          Clear
        </button>
        <!-- Added as any because I was not able to figure out how to add a specific additional field -->
        <button
          v-for="author in (chart.datasets as any)"
          :key="author.label"
          class="legend-item"
          :class="{ 'is-hidden': showingOnly.value.length > 0 && !showingOnly.value.includes(String(author.label)) }"
          :data-title-left="`${author.total} Quotes`"
          @click="setShowingUsers(author.label)"
        >
          <div class="legend-marker" :style="{ backgroundColor: String(author.backgroundColor) }" />
          {{ author.label }}

          <div class="flex-1" />
          <Icon code="e8f5" size="1.2" />
        </button>
      </div>
    </div>
  </div>
</template>
