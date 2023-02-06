import { computed } from 'vue'
import { get, set } from 'lodash'

/**
 * Shorthand function for writing computed({ get, set })
 *
 */
export function writableComputed(object: any, path: string) {
  return computed({
    get: () => get(object, path),
    set: value => set(object, path, value),
  })
}

/**
 * Countdown from a date
 */

// interface CountdownOptions {
//   start: DateInput
//   endsInMinutes: number
// }

// export function useCountdown(start: DateInput, endsInMinutes: number) {
//   const from = dayjs.utc(start)
//   let to = dayjs.utc(start).add(endsInMinutes, 'minute')

//   // console.log(start, to)

//   // Return types
//   const raw = ref<number>()
//   const format = ref<string>()

//   const interval = setInterval(() => {
//     if (diffDate(start, to, 'second') === 0) {
//       stop()
//     }
//     else {
//       to = to.add(1, 'second')

//       const difference = diffDate(start, to, 'millisecond')

//       // console.log(difference)

//       raw.value = dayjs.utc(difference).valueOf()
//       format.value = dayjs.utc(difference).format(displayDateHour)
//     }
//   }, 1000)

//   function stop() {
//     clearInterval(interval)
//   }

//   onBeforeUnmount(() => {
//     stop()
//   })

//   return {
//     stop,
//     raw,
//     format,
//   }
// }
