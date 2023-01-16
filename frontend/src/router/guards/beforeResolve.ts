import { isEmpty } from 'lodash'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { rootUrl } from '../../bin/fetch'

const key = 'quotes_bearer_token'

export default async function (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const token = localStorage.getItem(key)

  if (to.meta.requiresAuth) {
    if (!token) {
      const { token } = from.query as { token: string }

      if (isEmpty(token)) {
        localStorage.deleteItem(key)
        window.location.replace(`${rootUrl}/account/login`)
      }
      else { localStorage.setItem(key, token) }
    }
  }

  next()
}
