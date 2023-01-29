import { defineStore } from 'pinia'
import { isNil } from 'lodash'
import { get, put } from '../bin/fetch'
import type { EditableSettings, Settings, User } from '../types/user-types'
import { useToast } from '../store/toast'
import { useLoading } from '../store/loading'

interface State {
  username: string
  user: User
  settings: Settings
  users: User[]
  signedIn: boolean
  permissions: string[]
}

export const useUser = defineStore('user', {
  state: () => ({
    signedIn: !isNil(localStorage.getItem('quotes_bearer_token')),
    user: {},
    settings: {},
    users: [{}],
    username: '',
    permissions: [''],
  } as State),
  actions: {
    async fetchUsers() {
      const toast = useToast()
      const loading = useLoading()

      loading.add('users')

      get('/user')
        .then((res) => {
          this.user = res.find((u: User) => u.username === this.username)
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
})
