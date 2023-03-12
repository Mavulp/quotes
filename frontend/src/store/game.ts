import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import type { Fragment, GameState, Player } from '../types/game-types'

export const useGame = defineStore('game', () => {
  const state = reactive<GameState>({} as GameState)
  const players = ref<Player[]>([])
  const cfg = reactive({
    // Global Settings
    maxPlayerCount: 8,
    globalRoundLength: 30,
    difficulty: 'Medium',

    // Quote pool settings
    useCustomPool: false,

    // Game composition settings
    useCustomComposition: false,

    // Thse settings are only used if customComposition is OFF
    rounds: 10,
  })
  // This contains the game
  const fragments = ref<Fragment[]>([])

  function initGameState(gameId: string, admin: string) {
    Object.assign(state, {
      gameId,
      admin,
      paused: false,
      stage: 'setup',
      quotePool: [],
    })

    addPlayer(admin)
  }

  function addPlayer(username: string) {
    players.value.push({
      username,
      score: 0,
      ready: false,
    })
  }

  const isEveryoneReady = computed(() => players.value.every(p => p.ready))

  return {
    state,
    cfg,
    players,
    addPlayer,
    fragments,
    initGameState,
    isEveryoneReady,
  }
})
