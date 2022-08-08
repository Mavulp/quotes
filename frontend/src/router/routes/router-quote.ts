import RouteQuoteAddVue from "../views/quotes/RouteQuoteAdd.vue";
import RouteQuoteDetailVue from "../views/quotes/RouteQuoteDetail.vue";
import RouteQuoteListVue from "../views/quotes/RouteQuoteList.vue";

export default [
  {
    path: "/quote/add",
    name: "QuoteAdd",
    component: RouteQuoteAddVue,
    meta: {
      title: "Add a Quote",
      requiresAuth: true,
    },
  },
  {
    path: "/quote/:username/:number",
    name: "QuoteDetail",
    component: RouteQuoteDetailVue,
    meta: {
      title: "Quote Detail",
    },
  },
  {
    path: "/quote/list",
    name: "QuoteList",
    component: RouteQuoteListVue,
    meta: {
      title: "Quote List",
    },
  },
];
