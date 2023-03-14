import { defineStore } from 'pinia'
import { computed, reactive, ref, unref } from 'vue'
import { chunk, orderBy, shuffle } from 'lodash'
import type { Difficulty, Fragment, GameState, Gamemode, Player, RoundFillQuote, RoundGuessAuthor, RoundGuessQuotee, RoundTypes } from '../types/game-types'
import { useQuote } from '../store/quote'
import { getRanMinMax } from '../bin/utils'
import type { Quote } from '../types/quote-types'

// TODO: properly document
// TODO: sort exports
// TODO: figure out formula for counting points

export const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard']
export const gamemodeOptions = [
  { value: 'guess-the-quote', label: 'Guess The Quote' },
  { value: 'guess-the-author', label: 'Guess The Author' },
  { value: 'fill-the-quote', label: 'Fill The Quote' },
]
const gamemodeIds = Object.values(gamemodeOptions).map(g => g.value) as Gamemode[]
const gamemodeAmount = Object.keys(gamemodeOptions).length

export const useGame = defineStore('game', () => {
  const state = reactive<GameState>({} as GameState)
  const players = ref<Player[]>([])
  const cfg = reactive({
    // Global Settings
    maxPlayerCount: 8,
    globalRoundLength: 30,
    difficulty: 'Medium' as Difficulty,
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
      quotePool: new Set(),
      transformedPool: [],
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
      _input: null,
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
    const quotes = useQuote()
    //
    const quoteCount = cfg.useCustomPool
      ? fragments.value.reduce((count, fragment) => count += fragment.rounds, 0)
      : cfg.rounds

    // To make generating easier, just use set to store N amount of quotes
    const quoteIdPool: Set<number> = new Set()

    while (quoteIdPool.size < quoteCount) {
      const index = getRanMinMax(0, quotes.quotes.length)
      const quote = quotes.quotes[index]
      quoteIdPool.add(quote.id)
    }

    state.quotePool = quoteIdPool
    return quoteIdPool
  }

  // Takes in a quote pool and returns task pool
  function transformQuotes() {
    const quotes = useQuote()
    const transformed: RoundTypes[] = []

    if (cfg.useCustomComposition) {
      // Iterate over fragments
    }
    else {
      // Split amount of rounds by the amount of gamemodes
      const gamemdes = shuffle(gamemodeIds)

      const groups = chunk(
        [...state.quotePool],
        gamemodeAmount,
      )

      const difficulty = cfg.difficulty

      groups.forEach((group, index) => {
        for (const quoteId of group) {
          const quote = quotes.getQuoteById(quoteId)

          if (!quote)
            continue

          transformed.push(transformQuote(
            quote,
            gamemdes[index],
            difficulty,
            cfg.globalRoundLength,
          ))
        }
      })
    }
  }

  // Takes in a raw quote and returns a transformed Task
  function transformQuote(quote: Quote, type: Gamemode, difficulty: Difficulty, time: number): RoundTypes {
    // const round = {
    //   time,
    // }

    switch (type) {
      case 'fill-the-quote': {
        // Select relevant quote fragment
        const orderedFragments = orderBy(quote.fragments, ['type', 'highlight'], ['desc', 'desc'])[0]
        // Take the quote and based on difficulty extract 1-3 words from it
        const { content } = orderedFragments

        // Based on difficulty
        const len = difficulty === 'Easy'
          ? 1
          : difficulty === 'Medium'
            ? 2
            : 3

        const answers: string[] = []
        const words = new Set(content.split(/(\s+)/))
        for (let i = 0; i <= len; i++) {
          const index = getRanMinMax(0, words.size - 1)
          const word = [...words][index]
          answers.push(word)
        }

        return {
          originalQuote: quote,
          time,
          answers,
          difficulty,
          type: 'fill-the-quote',
        }
      }
      case 'guess-the-author': {
        return {} as RoundGuessAuthor
      }

      case 'guess-the-quote': {
        return {} as RoundGuessQuotee
      }
    }
  }

  /**
   * Computed properties
   */
  const isEveryoneReady = computed(() => players.value.every(p => p.ready))

  return {
    cfg,
    state,
    players,
    fragments,
    addPlayer,
    resetState,
    resetConfig,
    insertFragment,
    removeFragment,
    createQuotePool,
    isEveryoneReady,
  }
})
