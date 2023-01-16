import RouteQuoteCreate from '../views/quotes/RouteQuoteCreate.vue'
import RouteQuoteDetailVue from '../views/quotes/RouteQuoteDetail.vue'
import RouteQuoteListVue from '../views/quotes/RouteQuoteList.vue'

export default [
  {
    path: '/quote/add',
    name: 'RouteQuoteAdd',
    component: RouteQuoteCreate,
    meta: {
      title: 'Add a Quote',
      requiresAuth: true,
    },
  },
  {
    path: '/quote/:username/:number',
    name: 'RouteQuoteDetail',
    component: RouteQuoteDetailVue,
    meta: {
      title: 'Quote Detail',
      requiresAuth: true,
    },
  },
  {
    path: '/quote/list',
    name: 'RouteQuoteList',
    component: RouteQuoteListVue,
    meta: {
      title: 'Quote List',
      requiresAuth: true,
    },
  },
]
