<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { merge } from 'lodash'
import { computed } from 'vue'
import { useCssVar } from '@vueuse/core'

interface Props {
  data: ChartData<'bar'>
  config?: ChartOptions<'bar'>
  width?: string
  height?: string
  cost?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  width: '100%',
  height: '100%',
})

const defaultConfig: ChartOptions<'bar'> = {
  scales: {
    x: {
      grid: {
        color: useCssVar('--color-border').value,
      },
    },
    y: {
      grid: {
        color: useCssVar('--color-border').value,
      },
    },
  },
}

const mergedOptions = computed(() => {
  // Merge all options
  // #1 Shared chart options for every single chart
  // #2 Defaults specific for bar chart
  // #3 Developer defined options
  return merge(
    // { ...sharedChartOptions },
    defaultConfig,
    props.config,
    // props.cost ? useDollarInLabels : {},
  )
})
</script>

<template>
  <div class="graph-wrapper">
    <Bar :data="props.data" :options="mergedOptions" />
  </div>
</template>

<!-- <style scoped lang="scss">
.graph-wrapper {
  & > div {
    width: v-bind("width");
    height: v-bind("height");
  }
}
</style> -->
