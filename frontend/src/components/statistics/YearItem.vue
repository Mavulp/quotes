<script setup lang='ts'>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useCssVar } from '@vueuse/core'
import { fill } from 'lodash'
import { useRouter } from 'vue-router'
import { displayDateShort } from '../../bin/time'
import { getVal, percent } from '../../bin/utils'
import { hexToRgb } from '../../bin/color'
import type { DateCount } from '../../types/quote-types'
import { useFilters } from '../../store/filters'

const props = defineProps<{
  data: DateCount[]
  year: number
}>()

const bg = useCssVar('--color-bg-light')
const fg = useCssVar('--color-highlight')

const sortedUploads = computed(() => [...props.data].sort((a, b) => a.count > b.count ? -1 : 1))

// Get the day with the most uploads
const mostUploads = computed(() => sortedUploads.value[0])
// Total amount of uploads in the year
const totalUploads = computed(() => sortedUploads.value.reduce((group, item) => group += item.count, 0))

// Get the most active hours between 1 - 24
const activeHours = computed(() => props.data.reduce((group, item) => {
  const hour = dayjs.utc(item.date).get('hours')

  group[hour] ? group[hour]++ : group[hour] = 1
  return group
}, fill(Array(24), 0)))

const mostActiveHour = computed(() => Math.max.apply(0, activeHours.value))

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

      const minimum = 10
      const opacity = (percent(count, getVal(mostUploads.value)) * (1 - (minimum / 100)) + minimum) / 100

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

// Redirects to quote list and sets date range
const router = useRouter()
const filters = useFilters()

function filterOnQuotes(date: string) {
  const parsed = dayjs(date)

  filters.$patch({
    date: {
      from: parsed.startOf('day').valueOf(),
      to: parsed.endOf('day').valueOf(),
    },
  })

  router.push({ name: 'RouteQuoteList' })
}
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

      <button
        v-for="tile in days"
        :key="tile.date"
        class="month-tile"
        :class="{ 'tile-ignore': tile.count === 0 }"
        :style="{ backgroundColor: tile.color }"
        :data-title-top="tile.count > 0 ? `${tile.count} ${tile.count === 1 ? 'Quote' : 'Quotes'} | ${tile.date}` : null"
        @click="filterOnQuotes(tile.date)"
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
              Quotes
            </div>
          </td>
        </tr>
        <tr>
          <th>Active Hours</th>
          <!-- <td> {{ activeHour }} </td> -->

          <div class="hour-breakdown">
            <div v-for="hour in 24" :key="hour" class="hour-item" :data-title-bottom="`${hour}:00 - ${activeHours[hour - 1]} Quotes`">
              <div
                class="hour-progress"
                :style="{
                  height: `${percent(activeHours[hour - 1], mostActiveHour)}%`,
                  opacity: Math.max(35, percent(activeHours[hour - 1], mostActiveHour)) / 100,
                }"
              />
              <span>{{ hour % 4 === 0 || hour === 1 ? hour : null }}</span>
            </div>
          </div>
        </tr>
      </table>
    </div>
  </div>
</template>
