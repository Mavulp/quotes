import RouteQuoteCreate from '../views/quotes/RouteQuoteCreate.vue'
import RouteQuoteDetailVue from '../views/quotes/RouteQuoteDetail.vue'
import RouteQuoteListVue from '../views/quotes/RouteQuoteList.vue'

export default [
  {
    path: '/quotes/add',
    name: 'RouteQuoteAdd',
    component: RouteQuoteCreate,
    meta: {
      title: 'Add a Quote',
      requiresAuth: true,
    },
  },
  {
    path: '/quote/:id',
    name: 'RouteQuoteDetail',
    component: RouteQuoteDetailVue,
    meta: {
      title: 'Quote Detail',
      requiresAuth: true,
    },
  },
  {
    path: '/quotes',
    name: 'RouteQuoteList',
    component: RouteQuoteListVue,
    meta: {
      title: 'Quote List',
      requiresAuth: true,
    },
  },
]
