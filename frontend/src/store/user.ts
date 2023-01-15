import { defineStore } from 'pinia'
import { get, rootUrl } from '../bin/fetch'
import type flags from '../bin/flags'

interface UserSettings {
  bio: string
  colorTheme: 'light-theme' | 'dark-theme'
  country: keyof typeof flags
  displayName: string
  highlightedQuoteId: number
  profilePicture: string
}

interface User extends UserSettings {
  username: string
}

interface State {
  user: User
  settings: UserSettings
  users: User[]
}

export const useUser = defineStore('user', {
  state: () => ({
    user: {},
    settings: {},
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

    async fetchSettings() {
      get('/account/settings')
        .then((res) => {
          this.settings = res
        })
        .catch((res) => {
          console.log(res)
        })
    },

    // async fetchMe() {
    //   get('/account/settings')
    //     .then((res) => {
    //       this.settings = res
    //     })
    //     .catch((res) => {
    //       console.log(res)
    //     })
    // },
  },
  getters: {
    // getUser: (state) => (username: string) => state.
  },
})
