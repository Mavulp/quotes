<script setup lang='ts'>
import { computed, ref } from 'vue'
import { gradient } from '../../bin/color'
import { percent } from '../../bin/utils'
import type { Ratio } from '../../types/statistics-types'

const props = defineProps<{ data: Ratio }>()
const total = computed(() => props.data.posted + props.data.quoted)

const postedRatio = computed(() => percent(props.data.posted, total.value))
const quotedRatio = computed(() => percent(props.data.quoted, total.value))
</script>

<template>
  <li v-if="props.data.user">
    <router-link :to="{ name: 'RouteUserProfile', params: { username: props.data.user } }">
      {{ props.data.user }}
    </router-link>

    <div class="bar-wrap">
      <span>{{ props.data.posted }}</span>

      <div class="bar">
        <div
          v-if="postedRatio > 0"
          class="bar-item"
          :data-title-top="`${postedRatio.toFixed(1)}%`"
          :style="{ width: `${Math.round(postedRatio)}%` }"
        />
        <div
          v-if="quotedRatio > 0"
          class="bar-item"
          :data-title-top="`${quotedRatio.toFixed(1)}%`"
          :style="{ width: `${Math.round(quotedRatio)}%` }"
        />
      </div>

      <span>{{ props.data.quoted }}</span>
    </div>
  </li>
</template>
