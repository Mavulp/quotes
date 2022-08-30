// import { isEmpty, isNil } from "lodash"

// Select the first matching element in DOM
export const $ = (selector: string): Element | null => document.querySelector(selector)

// Returns all matching elements in the DOM
export const $$ = (selector: string): NodeList | null => document.querySelectorAll(selector)

// Returns a promise resolved after provided amount of ms
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), ms))
}

// Takes a number and if it is only 1 digit, prepends a 0
export function padTo2Digits(num: number) {
  return num.toString().padStart(2, "0")
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
    const _date = new Date(date)
    return _date.toLocaleDateString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  },
  time: (date: number) => {
    // date *= 1000
    const _date = new Date(date)

    return `${padTo2Digits(_date.getUTCHours())}:${padTo2Digits(
      _date.getUTCMinutes()
    )}, ${_date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })}`
  }
}

export function toBool(value: any): boolean {
  return value === "true" ? true : false
}

export type ValueOf<T> = T[keyof T]
