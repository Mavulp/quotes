import { isEmpty } from 'lodash'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { get, rootUrl } from '../../bin/fetch'
import { parseJwt } from '../../bin/utils'
import { useUser } from '../../store/user'
import { __LOCALHOST__ } from '../../bin/env'

const key = 'quotes_bearer_token'

function setupUser(token: string) {
  const user = useUser()
  const { name, groups } = parseJwt(token)

  user.$patch({
    username: name,
    permissions: groups,
    signedIn: true,
  })
}

export default async function (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const user = useUser()
  const token = localStorage.getItem(key)

  if (token && !user.username)
    setupUser(token)

  if (to.meta.requiresAuth || to.name === 'RouteAuthorize') {
    if (!token) {
      const { token, redirect_uri } = to.query as { token: string; redirect_uri: string }

      if (isEmpty(token)) {
        localStorage.removeItem(key)

        if (__LOCALHOST__) {
          window.location.replace('https://account.hivecom.net/login?service=quotes-dev&redirect_to=%2F')
        }
        else {
          fetch(`${rootUrl}/account/login`, {
            method: 'GET',
            redirect: 'follow',
            credentials: 'same-origin',
          })
            .then((res: any) => {
              if (res.redirected) {
                const redirectedToUrl = res.url
                window.location.replace(redirectedToUrl)
              }
            })
        }
      }
      else {
        localStorage.setItem(key, token)
        setupUser(token)

        await get(`/auth/authorize?redirect_uri=${redirect_uri}&token=${token}`)
          .finally(() => {
            return next({ name: 'RouteHome' })
          })
      }
    }

    next()
  }
}
