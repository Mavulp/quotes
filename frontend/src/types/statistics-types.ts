export interface RawDataset {
  label: 'string'
  data: Array<number | null>
  total: number
}

export interface StatisticsChartRaw {
  labels: string[]
  datasets: RawDataset[]
}

export interface StatisticsChartNormalized {
  labels: string[]
  datasets: RawDataset & {
    borderWidth: number
    spanGaps: boolean
    pointStyle: boolean
    borderColor: string
    backgroundColor: string
  }[]
}

export interface Ratio {
  user: string
  quoted: number
  posted: number
}
