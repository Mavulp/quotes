<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js'
import { debounce, isEmpty, take, takeRight } from 'lodash'
import { computed, onBeforeMount, reactive, ref } from 'vue'
import { gradient } from '../../bin/color'
import { useLoading } from '../../store/loading'
import { useStats } from '../../store/statistics'

import Line from '../charts/Line.vue'

const loading = useLoading()
const stats = useStats()

const hoveredUser = ref<string | null>(null)
const hiddenUsers = reactive<{ value: string[] }>({ value: [] })
const quotee = computed(() => stats.quotee)

onBeforeMount(() => {
  stats.fetchQuoteeStats()
    .then((res) => {
      // hiddenUsers.value = takeRight(res.datasets, res.datasets.length - 10).map(set => set.label)
    })
})

function setHiddenUser(user?: string) {
  if (!user)
    return

  if (hiddenUsers.value.includes(user))
    hiddenUsers.value = hiddenUsers.value.filter(u => u !== user)
  else
    hiddenUsers.value.push(user)
}

const setHoveredUser = debounce((user: string | null) => {
  hoveredUser.value = user
}, 100)

const chart = computed<ChartData<'line'> | null>(() => {
  if (isEmpty(quotee.value))
    return null

  return {
    labels: quotee.value.labels,
    datasets: quotee.value.datasets.map((dataset, index) => {
      const color = gradient[index % gradient.length]
      const actualColor = (hoveredUser.value === dataset.label || hoveredUser.value === null) ? color : `${color}22`

      return {
        ...dataset,
        borderWidth: 3,
        spanGaps: true,
        pointStyle: false,
        borderColor: actualColor,
        backgroundColor: actualColor,
        hidden: hiddenUsers.value.includes(dataset.label),
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
        maxTicksLimit: 6,
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

    <Spinner v-if="loading.get('stats-quotee')" />

    <div v-else-if="chart" class="chart-wrapper">
      <Line class="chart-graph" :data="chart" :config="options" />

      <div class="chart-legend">
        <button
          v-for="author in chart.datasets"
          :key="author.label"
          class="legend-item"
          :class="{ 'is-hidden': hiddenUsers.value.includes(String(author.label)) }"
          @mouseenter="setHoveredUser(String(author.label))"
          @mouseleave="setHoveredUser(null)"
          @click="setHiddenUser(author.label)"
        >
          <div class="legend-marker" :style="{ backgroundColor: String(author.borderColor) }" />
          {{ author.label }}

          <div class="flex-1" />
          <Icon code="e8f5" size="1.2" />
        </button>
      </div>
    </div>
  </div>
</template>
