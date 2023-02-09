import type { RouteLocationNormalized } from 'vue-router'

export default async function (to: RouteLocationNormalized, from: RouteLocationNormalized) {
  document.title = `${to.meta.title} // Hivecom Quotes`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
