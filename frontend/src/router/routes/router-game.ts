import RouteGame from '../views/RouteGame.vue'
import RouteGameCreateRoom from '../views/game/RouteGameCreateRoom.vue'
import RouteGameSetupRoom from '../views/game/RouteGameSetupRoom.vue'
import RouteGameInProgress from '../views/game/RouteGameInProgress.vue'
import RouteGameEnded from '../views/game/RouteGameEnded.vue'

export default [
  {
    path: '/game',
    name: 'RouteGame',
    component: RouteGame,
    meta: {
      title: 'Quote Game',
      requiresAuth: true,
    },
    redirect: {
      name: 'RouteGameEnded',
      params: { id: 'whatever' },
    },
    children: [
      {
        path: '/game/create',
        name: 'RouteGameCreateRoom',
        component: RouteGameCreateRoom,
        meta: {
          title: 'Start a new game!',
        },
      },
      {
        path: '/game/:id',
        name: 'RouteGameSetupRoom',
        component: RouteGameSetupRoom,
        meta: {
          title: 'Starting soon...',
        },
      },
      {
        path: '/game/:id/playing',
        name: 'RouteGameInProgress',
        component: RouteGameInProgress,
        meta: {
          title: 'Playing',
        },
      },
      {
        path: '/game/:id/finished',
        name: 'RouteGameEnded',
        component: RouteGameEnded,
        meta: {
          title: 'Game Complete.',
        },
      },
    ],
  },
]
