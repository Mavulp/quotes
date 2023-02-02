<script setup lang='ts'>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useCssVar } from '@vueuse/core'
import { displayDateLong, displayDateShort } from '../../bin/time'
import { date, getKey, getVal, objectToArray, padTo2Digits, percent } from '../../bin/utils'
import { hexToRgb } from '../../bin/color'
import type { DateCount } from '../../types/quote-types'

const props = defineProps<{
  data: DateCount[]
  year: number
}>()

const bg = useCssVar('--color-bg-light')
const fg = useCssVar('--color-secondary')

const sortedUploads = computed(() => [...props.data].sort((a, b) => a.count > b.count ? -1 : 1))

// Get the day with the most uploads
const mostUploads = computed(() => sortedUploads.value[0])
// Total amount of uploads in the year
const totalUploads = computed(() => sortedUploads.value.reduce((group, item) => group += item.count, 0))

// Get the most active hours
const activeHour = computed(() => {
  const [first] = [...props.data].sort((a, b) => a.date > b.date ? -1 : 1)
  const hours = dayjs.utc(first.date).get('hours')
  return `${padTo2Digits(hours - 1)}-${padTo2Digits(hours + 1)}`
})

const yearModel = computed(() => {
  const model: Record<string, { date: string; count: number; color: string }[]> = {}

  // #1 Iterate from 0 to 11 over months
  for (let m = 0; m <= 11; m++) {
    // #2 create date from year and a month, return days in month and iterate over them
    const month = dayjs.utc().month(m).year(props.year)
    const monthKey = month.format()

    model[monthKey] = []

    for (let d = 1; d <= month.daysInMonth(); d++) {
      const day = month.date(d)
      const match = props.data.find(item => dayjs.utc(item.date).isSame(day, 'day'))
      const count = match ? getVal(match) : 0

      const opacity = Math.max(35, percent(count, getVal(mostUploads.value))) / 100

      // #3 Save each day as unix timestamp into the object
      model[monthKey].push({
        date: day.format(displayDateShort),
        count,
        color: match
          ? `rgba(${hexToRgb(fg.value, true)}, ${opacity})`
          : bg.value,
      })
    }
  }

  return model
})
</script>

<template>
  <div class="year-item">
    <div class="month-row days-count">
      <span class="month-title" />
      <div v-for="day in 31" :key="day" class="month-tile">
        {{ day % 7 === 0 || day === 1 ? day : null }}
      </div>
    </div>
    <div v-for="(days, month) in yearModel" :key="month" class="month-row">
      <span class="month-title">{{ dayjs.utc(month).format('MMMM') }}</span>

      <div
        v-for="tile in days"
        :key="tile.date"
        class="month-tile"
        :style="{ backgroundColor: tile.color }"
        :data-title-top="tile.count > 0 ? `${tile.count} ${tile.count === 1 ? 'Quote' : 'Quotes'} | ${tile.date}` : null"
      />
    </div>

    <!-- <div class="month-row days-count">
      <span class="month-title" />
      <div v-for="day in 31" :key="day" class="month-tile">
        {{ day % 7 === 0 || day === 1 ? day : null }}
      </div>
    </div> -->

    <div class="year-top-level">
      <hr>

      <table>
        <tr>
          <th>Quotes</th>
          <td>{{ totalUploads }}</td>
        </tr>
        <tr>
          <th>Most active day</th>
          <td>
            <div>
              {{ dayjs.utc(mostUploads.date).format(displayDateShort) }}
              <div class="dot-padder" />
              <b>{{ getVal(mostUploads) }}</b>
              Uploads
            </div>
          </td>
        </tr>
        <tr>
          <th>Most Active Hours</th>
          <td> {{ activeHour }} </td>
        </tr>
      </table>
    </div>
  </div>
</template>
