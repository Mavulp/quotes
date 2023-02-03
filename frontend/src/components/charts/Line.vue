<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import { merge } from 'lodash'
import { computed } from 'vue'
import { useCssVar } from '@vueuse/core'

interface Props {
  data: ChartData<'line'>
  config?: ChartOptions<'line'>
  width?: string
  height?: string
  cost?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  config: () => ({}),
  width: '100%',
  height: '100%',
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
    <Line :data="props.data" :options="mergedOptions" />
  </div>
</template>

<style scoped lang="scss">
.graph-wrapper {
  & > div {
    width: v-bind("width");
    height: v-bind("height");
  }
}
</style>
