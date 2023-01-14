import RouteHomeVue from '../views/RouteHome.vue'
import RouteAdminVue from '../views/RouteAdmin.vue'

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
    },
  },
  {
    path: '/',
    name: 'RouteAdmin',
    component: RouteAdminVue,
    meta: {
      title: 'Admin',
    },
  },
]
