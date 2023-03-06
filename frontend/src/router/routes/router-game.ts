import RouteGuessVue from '../views/RouteGuess.vue'

export default [
  {
    path: '/guess',
    name: 'RouteGuessQuote',
    component: RouteGuessVue,
    meta: {
      title: 'Guess the Quotee',
      requiresAuth: true,
    },
  },
]
