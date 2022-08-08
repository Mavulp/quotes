import RouteHomeVue from "../views/RouteHome.vue";
import RouteAdminVue from "../views/RouteAdmin.vue";

export default [
  {
    path: "/:pathMatch(.*)*",
    redirect: { name: "Home" },
  },
  {
    path: "/",
    name: "Home",
    component: RouteHomeVue,
    meta: {
      title: "Home",
    },
  },
  {
    path: "/",
    name: "Admin",
    component: RouteAdminVue,
    meta: {
      title: "Admin",
    },
  },
];
