import { defineStore } from 'pinia'
import { isNil } from 'lodash'
import { get, put } from '../bin/fetch'
import type { EditableSettings, Settings, User } from '../types/user-types'
import { useToast } from '../store/toast'
import { useLoading } from '../store/loading'

interface State {
  user: User
  settings: Settings
  users: User[]
  signedIn: boolean
}

export const useUser = defineStore('user', {
  state: () => ({
    signedIn: !isNil(localStorage.getItem('quotes_bearer_token')),
    user: {
      // TODO: need to get this from somewhere
      username: 'dolanske',
    },
    settings: {},
    users: [{}],
  } as State),
  actions: {
    async fetchUsers() {
      const toast = useToast()
      const loading = useLoading()

      loading.add('users')

      get('/user')
        .then((res) => {
          this.user = res.find((u: User) => u.username === this.user.username)
          this.users = res
        })
        .catch(() => toast.push({ type: 'error', message: 'Error fetching users' }))
        .finally(() => loading.del('users'))
    },

    async fetchUser(username: string) {
      const toast = useToast()
      const loading = useLoading()

      loading.add('user')

      return get(`/user/${username}`)
        .then(res => res)
        .catch(() => toast.push({ type: 'error', message: 'Error fetching user data' }))
        .finally(() => loading.del('user'))
    },

    async fetchSettings() {
      const toast = useToast()
      const loading = useLoading()

      loading.add('settings')

      return get('/account/settings')
        .then((res) => {
          this.settings = res
        })
        .catch(() => toast.push({ type: 'error', message: 'Error fetching user settings' }))
        .finally(() => loading.del('settings'))
    },

    async updateSettings(form: EditableSettings) {
      const toast = useToast()

      return put('/account/settings', form)
        .then(() => {
          this.fetchUsers()
          toast.push({ type: 'success', message: 'Succesfully updating settings' })
        })
        .catch(() => toast.push({ type: 'error', message: 'Error updating settings' }))
    },
  },
  getters: {
    getUsername: state => (username?: string) => {
      // No username means the currently signed in user
      if (!username)
        return state.user.displayName ?? state.user.username

      // Query user by username
      const exists = state.users.find(user => user.username === username)

      // Return displayname OR normal username
      return exists?.displayName ?? username
    },

  },
})
