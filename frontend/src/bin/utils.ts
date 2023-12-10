// import { isEmpty, isNil } from "lodash"

import { isArray } from 'lodash'

// Select the first matching element in DOM
export const $ = (selector: string): Element | null => document.querySelector(selector)

// Returns all matching elements in the DOM
export const $$ = (selector: string): NodeList | null => document.querySelectorAll(selector)

// Returns a promise resolved after provided amount of ms
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(() => resolve(true), ms))
}

// Takes a number and if it is only 1 digit, prepends a 0
export function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0')
}

// Clamps the provided value between the provided min and max
// Example (10, 150, 100) returns 100
// Example (10, 5, 100) returns 10

export function clamp(min: number, value: number, max: number) {
  return Math.max(min, Math.min(value, max))
}

// Date object
export const date = {
  simple: (date: number) => {
    const _date = new Date(date * 1000)
    return _date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  },
  time: (date: number) => {
    const _date = new Date(date * 1000)

    return `${padTo2Digits(_date.getUTCHours())}:${padTo2Digits(
      _date.getUTCMinutes(),
    )}, ${_date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`
  },
  timeShort: (date: number) => {
    const _date = new Date(date * 1000)

    return `${padTo2Digits(_date.getUTCHours())}:${padTo2Digits(
      _date.getUTCMinutes(),
    )}, ${_date.toLocaleDateString('en-GB', {
      year: '2-digit',
      month: 'numeric',
      day: 'numeric',
    })}`
  },

  tiny: (date: number) => {
    const _date = new Date(date * 1000)

    return _date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
  },
}

export function toBool(value: any): boolean {
  return value === 'true'
}

export type ValueOf<T> = T[keyof T]

export function getRanMinMax(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

export function searchInStr(match: string | string[], search: string) {
  if (!match)
    return false

  const joint: string = isArray(match) ? match.join(' ') : match

  const split = search.trim().split(/\s+/)
  return split.every(s => joint.toLowerCase().includes(s.toLowerCase()))
}

export function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
    return `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`
  }).join(''))

  return JSON.parse(jsonPayload)
}

export function toNum(num: number) {
  return num.toLocaleString()
}

export function objectToArray(obj: Record<any, any>) {
  return Object.entries(obj).map(e => ({ [e[0]]: e[1] }))
}

export function getKey(object: Record<any, any>, index = 0) {
  return Object.keys(object)[index]
}

export function getVal(object: Record<any, any>, index = 0) {
  return Object.values(object)[index]
}

export function percent(partial: number, total: number) {
  return (100 * partial) / total
}

// Checkes wether value is a number and a positive/negative infinity
export function isInfinity(value: any) {
  if (typeof value !== 'number')
    return false

  return value === -Infinity || value === Infinity
}

/**
 * Takes in a partial and a full number and returns amount of percent by which the partial changed.
 * I am not smart enough to tell you the difference so I will show you the formula.
 *
 * partial - total
 * --------------- x 100
 *       total
 */
export function diffPercent(partial: number, total: number, returnInfinity = false) {
  const diff = partial - total
  const percent = (diff / total) * 100

  if (returnInfinity && isInfinity(percent))
    return percent === -Infinity ? -100 : 100

  return percent
}

/**
 * Splits array into equally large chunks
 */
export function arrayIntoChunks<T = any>(items: Array<T>, columns = 3) {
  if (!items)
    return []

  const makeArray = (cols: number) => Array.from(Array(cols).keys()).map(() => [])

  const chunks: Array<Array<T>> = makeArray(columns)

  let i = 0
  let j = 0

  while (i !== items.length) {
    chunks[j].push(items[i])

    if (j >= columns - 1)
      j = 0
    else j++

    i++
  }

  return chunks
}
