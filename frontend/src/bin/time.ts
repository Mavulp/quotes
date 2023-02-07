import dayjs from 'dayjs'

export const displayDateShort = 'DD/MM/YYYY'
export const displayDateLong = 'dddd, DD/MM/YYYY'
export const dipslayDateTime = 'HH:MM DD/MMMM/YYYY'
export const displayDateHour = 'HH:MM:ss'

/**
 * Returns amount of time between two dates in the amount of provided type (days, months, etc)
 */

export type DifferenceUnit = 'day' | 'week' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'millisecond'
export type DateInput = string | number | Date | dayjs.Dayjs

export function diffDate(start: DateInput, end: DateInput, unit: DifferenceUnit = 'month') {
  return dayjs.utc(start).diff(dayjs.utc(end), unit)
}

/**
 * Generates an array of dates between (inclusive) provided dates.
 * Caveat: `from` must always be before `to` as a date
 */
export function dateRange(from: DateInput, to: DateInput, unit: DifferenceUnit = 'month', format?: string) {
  const differnce = diffDate(to, from, unit)
  const ranges = []

  for (let i = 0; i <= differnce; i++) {
    const d = dayjs.utc(from).add(i, unit).startOf(unit)

    if (format)
      ranges.push(d.format(format))
    else
      ranges.push(d)
  }

  return ranges as typeof format extends string ? string[] : dayjs.Dayjs[]
}
