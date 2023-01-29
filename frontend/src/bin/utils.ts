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
