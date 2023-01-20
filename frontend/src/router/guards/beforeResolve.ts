import { isEmpty } from 'lodash'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { rootUrl } from '../../bin/fetch'
import { useUser } from '../../store/user'

const key = 'quotes_bearer_token'

export default async function (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const user = useUser()
  const token = localStorage.getItem(key)

  if (to.meta.requiresAuth || to.name === 'RouteAuthorize') {
    if (!token) {
      const { token } = to.query as { token: string }

      if (isEmpty(token)) {
        localStorage.removeItem(key)
        window.location.replace(`${rootUrl}/account/login`)
      }
      else {
        localStorage.setItem(key, token)
        user.$patch({ signedIn: true })
        return next({ name: 'RouteHome' })
      }
    }
  }

  next()
}
