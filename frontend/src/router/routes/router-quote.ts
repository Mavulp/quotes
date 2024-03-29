import RouteQuoteCreate from '../views/quotes/RouteQuoteCreate.vue'
import RouteQuoteDetail from '../views/quotes/RouteQuoteDetail.vue'
import RouteQuoteList from '../views/quotes/RouteQuoteList.vue'
import RouteTags from '../views/quotes/RouteTags.vue'

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
    path: '/quote/:id',
    name: 'RouteQuoteDetail',
    component: RouteQuoteDetail,
    meta: {
      title: 'Quote Detail',
      requiresAuth: true,
    },
  },
  {
    path: '/quotes',
    name: 'RouteQuoteList',
    component: RouteQuoteList,
    meta: {
      title: 'Quote List',
      requiresAuth: true,
    },
  },
  {
    path: '/tags',
    name: 'RouteTags',
    component: RouteTags,
    meta: {
      title: 'Tags',
      requiresAuth: true,
    },
  },
]
