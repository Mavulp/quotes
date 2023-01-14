import { defineStore } from 'pinia'
import { get, rootUrl } from '../bin/fetch'
import type flags from '../bin/flags'

interface User {
  bio: string
  colorTheme: 'light-theme' | 'dark-theme'
  country: keyof typeof flags
  displayName: string
  highlightedQuoteId: number
  profilePicture: string
}

interface State {
  user: User
  users: User[]
}

export const useUser = defineStore('user', {
  state: () => ({
    user: {},
    users: [{}],
  } as State),
  actions: {

    async redirectToSignIn() {
      window.location.replace(`${rootUrl}/account/login`)
    },
    async fetchUsers() {
      get('/user')
        .then((res) => {
          console.log(res)
          this.users = res
        })
        .catch((e) => {
          console.log(e)
        })
    },
  },
  getters: {

  },
})
