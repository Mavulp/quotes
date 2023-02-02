<script setup lang='ts'>
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useCssVar } from '@vueuse/core'
import { displayDateShort } from '../../bin/time'
import { getKey, getVal, percent } from '../../bin/utils'

const props = defineProps<{
  data: Record<string, number>[]
  year: number
}>()

// Highest amount of uploads in a day
const mostUploads = computed(() => [...props.data].sort((a, b) => getVal(a) > getVal(b) ? -1 : 1)[0])

const bg = useCssVar('--color-bg-light')
const hg = useCssVar('--color-highlight')

const yearModel = computed(() => {
  const model: Record<string, { date: string; count: number; color: string }[]> = {}

  // #1 Iterate from 0 to 11 over months
  for (let m = 0; m <= 11; m++) {
    // #2 create date from year and a month, return days in month and iterate over them
    const month = dayjs.utc().month(m).year(props.year)
    const monthKey = month.format()

    model[monthKey] = [] as any

    for (let d = 1; d <= month.daysInMonth(); d++) {
      const day = month.date(d)
      const match = props.data.find(item => dayjs.utc(getKey(item)).isSame(day, 'day'))
      const count = match ? getVal(match) : 0

      const opacity = Math.max(30, percent(count, getVal(mostUploads.value))) / 100

      console.log(count, opacity)

      // #3 Save each day as unix timestamp into the object
      model[monthKey].push({
        date: day.format(displayDateShort),
        count,
        color: match
          ? `rgba(242, 155, 65,${opacity})`
          : bg.value,
      },
      )
    }
  }

  return model
})

// function getTileColor(count: number) {
//   if (count <= 0)
//     return useCssVar('--color-bg-light').value

//

//   console.log(`rgba(${useCssVar('--color-highlight').value},${opacity})`)

//   return `rgba(${useCssVar('--color-highlight').value},${opacity})`
// }
</script>

<template>
  <div class="year-item">
    <!-- <pre>
      {{ mostUploads }}
    </pre> -->
    <div v-for="(days, month) in yearModel" :key="month" class="month-row">
      <span class="month-title">
        {{ dayjs.utc(month).format('MMMM') }}
      </span>

      <div
        v-for="tile in days"
        :key="tile.date"
        class="month-tile"
        :class="{ 'has-items': tile.count > 0 }"
        :style="{ backgroundColor: tile.color }"
        :data-title-top="tile.count > 0 ? `${tile.count} ${tile.count === 1 ? 'Quote' : 'Quotes'} | ${tile.date}` : null"
      />
    </div>
  </div>
</template>
