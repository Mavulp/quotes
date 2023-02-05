import { getRanMinMax } from './utils'

export function hexToRgb(hex: string, format = false) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  if (!result)
    return '0,0,0'

  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)

  return format ? `${r},${g},${b}` : { r, g, b }
}

export function getRndColor() {
  let color = '#'
  for (let i = 0; i < 3; i++)
    color += (`0${Math.floor(((1 + Math.random()) * 16 ** 2) / 1.25).toString(16)}`).slice(-2)
  return color
}

export const gradient = [
  '#6f4c9b',
  '#6059a9',
  '#5568b8',
  '#4e79c5',
  '#4d8ac6',
  '#4e96bc',
  '#549eb3',
  '#59a5a9',
  '#60ab9e',
  '#69b190',
  '#77b77d',
  '#8cbc68',
  '#a6be54',
  '#bebc48',
  '#d1b541',
  '#ddaa3c',
  '#e49c39',
  '#e78c35',
  '#e67932',
  '#e4632d',
  '#df4828',
  '#da2222',
]

export function colorOfTheDay() {
  const date = new Date()
  // Gives back the number of the day in the year
  const day = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
  // Get a random brightness
  const tint = getRanMinMax(50, 85)

  return {
    light: `hsla(${day}, ${tint}%, ${60}%)`,
    normal: `hsla(${day}, ${tint}%, ${50}%)`,
    dark: `hsla(${day}, ${tint}%, ${40}%)`,
  }
}
