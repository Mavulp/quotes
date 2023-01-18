import RouteHomeVue from '../views/RouteHome.vue'
import RouteAdminVue from '../views/RouteAdmin.vue'
import RouteGuessVue from '../views/RouteGuess.vue'
import RouteStatisticsVue from '../views/RouteStatistics.vue'
import RouteUsersVue from '../views/RouteUsers.vue'

export default [
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'RouteHome' },
  },
  {
    path: '/',
    name: 'RouteHome',
    component: RouteHomeVue,
    meta: {
      title: 'Home',
      requiresAuth: true,
    },
  },
  {
    path: '/guess',
    name: 'RouteGuessQuote',
    component: RouteGuessVue,
    meta: {
      title: 'Guess the Quotee',
      requiresAuth: true,
    },
  },
  {
    path: '/statistics',
    name: 'RouteStatistics',
    component: RouteStatisticsVue,
    meta: {
      title: 'Statistics',
      requiresAuth: true,
    },
  },
  {
    path: '/users',
    name: 'RouteUsers',
    component: RouteUsersVue,
    meta: {
      title: 'Users',
      requiresAuth: true,
    },
  },
  {
    path: '/',
    name: 'RouteAdmin',
    component: RouteAdminVue,
    meta: {
      title: 'Admin',
      requiresAuth: true,
    },
  },
]
