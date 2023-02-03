<script setup lang='ts'>
import type { ChartData, ChartOptions } from 'chart.js'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { dateRange, displayDateShort } from '../../bin/time'
import { useQuote } from '../../store/quote'
import type { DateCount, Quote } from '../../types/quote-types'
import { getRndColor } from '../../bin/color'

import Line from '../charts/Line.vue'

const props = defineProps<{
  range: [Quote, Quote]
}>()

const quote = useQuote()

const timestamps = computed(() => {
  const [first, last] = props.range
  return dateRange(first.createdAt * 1000, last.createdAt * 1000, 'day')
})

const authors = computed(() => {
  // #1 Iterate over all users and save their quotes by date
  return quote.quotes.reduce((group, q) => {
    const day = dayjs.utc(q.createdAt * 1000).valueOf()

    // const index = group[q.author]?.data?.findIndex(entry => entry.date === day) ?? -1

    if (!group[q.author])
      group[q.author] = { data: [], sum: 1 }

    group[q.author].data.push({
      count: group[q.author].sum,
      date: day,
    })

    group[q.author].sum++

    return group
  }, {} as Record<string, { data: DateCount[]; sum: number }>)
})

const chart = computed<ChartData<'line'>>(() => {
  return {
    labels: timestamps.value.map(date => date.format(displayDateShort)),
    datasets: Object.entries(authors.value).map(([author, items]) => {
      // Must iterate over generated label
      const color = getRndColor()

      return {
        label: author,
        data: timestamps.value.map((stamp) => {
          const item = items.data.find(item => stamp.isSame(item.date, 'day'))
          return item ? item.count : null
        }).reverse(),
        tension: 0,
        borderWidth: 2,
        spanGaps: true,
        pointStyle: false,
        borderColor: color,
        backgroundColor: color,
      }
    }),
  }
})

const options: ChartOptions<'line'> = {
  animation: false,
  normalized: true,
  plugins: {
    tooltip: {
      intersect: true,
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
        maxTicksLimit: 20,
      },
    },
  },
}
</script>

<template>
  <div class="ladder-breakdown chart-breakdown">
    <Line :data="chart" :config="options" />

    <div class="chart-legend">
      <div v-for="author in chart.datasets" :key="author.label" class="legend-item">
        <div class="legend-marker" :style="{ backgroundColor: String(author.borderColor) }" />
        {{ author.label }}
      </div>
    </div>
  </div>
</template>
