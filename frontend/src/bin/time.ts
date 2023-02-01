import dayjs from 'dayjs'

export const displayDateShort = 'DD/MM/YYYY'
export const dipslayDate = 'HH:MM DD/MMMM/YYYY'

/**
 * Returns amount of time between two dates in the amount of provided type (days, months, etc)
 */

type DifferenceUnit = 'day' | 'week' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'millisecond'

export function diffDate(start: string | Date, end: string | Date, unit: DifferenceUnit = 'month') {
  return dayjs.utc(start).diff(dayjs.utc(end), unit)
}

/**
 * Generates an array of dates between (inclusive) provided dates.
 * Caveat: `from` must always be before `to` as a date
 */
export function dateRange(from: string | Date, to: string | Date, unit: DifferenceUnit = 'month') {
  const differnce = diffDate(to, from, unit) + 1
  const ranges = []

  for (let i = 0; i < differnce; i++) {
    const d = dayjs.utc(from).add(i, unit).startOf(unit).format()
    ranges.push(d)
  }

  return ranges
}
