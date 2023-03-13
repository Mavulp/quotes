import { defineStore } from 'pinia'
import { computed, reactive, ref, unref } from 'vue'
import type { Difficulty, Fragment, GameState, Player } from '../types/game-types'

// TODO: properly document
// TODO: sort exports

export const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard']
export const gamemodeOptions = [
  { value: 'guess-the-quote', label: 'Guess The Quote' },
  { value: 'guess-the-author', label: 'Guess The Author' },
  { value: 'fill-the-quote', label: 'Fill The Quote' },
]

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

  function resetState(gameId: string, admin: string) {
    Object.assign(state, {
      gameId,
      admin,
      paused: false,
      stage: 'setup',
      quotePool: [],
    })

    addPlayer(admin)
  }

  function resetConfig() {
    Object.assign(cfg, {
      maxPlayerCount: 8,
      globalRoundLength: 30,
      difficulty: 'Medium',
      useCustomPool: false,
      useCustomComposition: false,
      rounds: 10,
    })
  }

  function addPlayer(username: string) {
    players.value.push({
      username,
      score: 0,
      ready: false,
    })
  }

  function insertFragment() {
    fragments.value.push({
      type: 'guess-the-quote',
      rounds: 8,
      roundTime: 30,
      difficulty: unref(cfg.difficulty) as Difficulty,
    })
  }

  function removeFragment(index: number) {
    fragments.value.splice(index, 1)
  }

  function createQuotePool() {
    //
    const quotesAmount = cfg.useCustomPool
      ? fragments.value.reduce((count, fragment) => count += fragment.rounds, 0)
      : cfg.rounds

    // To make generating easier, just use set to store N amount of quotes
    const quoteSet: Set<number> = new Set()
  }

  /**
   * Computed properties
   */
  const isEveryoneReady = computed(() => players.value.every(p => p.ready))
  const isGameReady = computed(() => {
    /**
     * Condition for game to begin
     *
     * Pool must contain at least 1 quote
     * All players are ready
     * There must be less or equal players than max players
     *
     * There must be at least 1 fragment and they must be validated
     *
     */
    // const quotes = useQuote()

    return false
  })

  return {
    state,
    cfg,
    players,
    addPlayer,
    fragments,
    resetConfig,
    resetState,
    insertFragment,
    removeFragment,
    createQuotePool,
    isEveryoneReady,
  }
})
