import { isEmpty } from 'lodash'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { get, rootUrl } from '../../bin/fetch'
import { parseJwt } from '../../bin/utils'
import { useUser } from '../../store/user'
import { __LOCALHOST__ } from '../../bin/env'

const key = 'quotes_bearer_token'

export default async function (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const user = useUser()
  const token = localStorage.getItem(key)

  if (token && !user.username) {
    const { name } = parseJwt(token)
    user.$patch({ username: name })
  }

  if (to.meta.requiresAuth || to.name === 'RouteAuthorize') {
    if (!token) {
      const { token, redirect_uri } = to.query as { token: string; redirect_uri: string }

      if (isEmpty(token)) {
        localStorage.removeItem(key)

        if (__LOCALHOST__) {
          window.location.replace('https://account.hivecom.net/login?service=quotes-dev&redirect_to=%2F')
        }
        else {
          await fetch(`${rootUrl}/account/login`, {
            redirect: 'follow',
            credentials: 'same-origin',
          })
        }
      }
      else {
        const { name } = parseJwt(token)
        localStorage.setItem(key, token)

        user.$patch({
          username: name,
          signedIn: true,
        })

        await get(`/auth/authorize?redirect_uri=${redirect_uri}&token=${token}`)

        return next({ name: 'RouteHome' })
      }
    }

    next()
  }
}
