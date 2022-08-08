import RouteUserProfileVue from "../views/user/RouteUserProfile.vue";
import RouteUserSettingsVue from "../views/user/RouteUserSettings.vue";
import RouteLoginVue from "../views/RouteLogin.vue";

export default [
  {
    path: "/:username",
    name: "UserProfile",
    component: RouteUserProfileVue,
    meta: {
      title: "User profile",
      requiresAuth: true,
    },
  },
  {
    path: "/settings",
    name: "UserSettings",
    component: RouteUserSettingsVue,
    meta: {
      title: "User settings",
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "Login",
    component: RouteLoginVue,
    meta: {
      title: "Login",
    },
  },
];
