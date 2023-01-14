import RouteUserProfileVue from '../views/user/RouteUserProfile.vue'
import RouteUserSettingsVue from '../views/user/RouteUserSettings.vue'
// import RouteLoginVue from "../views/RoutźeLogin.vue";
import RouteAuth from '../views/RouteAuth.vue'

export default [
  {
    path: '/:username',
    name: 'RouteUserProfile',
    component: RouteUserProfileVue,
    meta: {
      title: 'User profile',
      requiresAuth: true,
    },
  },
  {
    path: '/settings',
    name: 'RouteUserSettings',
    component: RouteUserSettingsVue,
    meta: {
      title: 'User settings',
      requiresAuth: true,
    },
  },
  {
    path: '/authorize',
    name: 'RouteAuthorize',
    component: RouteAuth,
  },
  // {
  //   path: "/login",
  //   name: "Login",
  //   component: RouteLoginVue,
  //   meta: {
  //     title: "Login",
  //   },
  // },
]
