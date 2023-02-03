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
