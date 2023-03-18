import { defineStore } from 'pinia'
import { computed, reactive, ref, unref } from 'vue'
import { orderBy, shuffle } from 'lodash'
import type { Difficulty, Fragment, GameState, Gamemode, Player, RoundTypes } from '../types/game-types'
import { useQuote } from '../store/quote'
import type { ValueOf } from '../bin/utils'
import { arrayIntoChunks, getRanMinMax } from '../bin/utils'
import type { Quote } from '../types/quote-types'
import { useUser } from './user'

// TODO: properly document
// TODO: sort exports
// TODO: figure out formula for counting points
// TODO: Add round history, per player
//          - save their answer (and if it was correct)
//          - how many points they goet
//          - how long it took to answer

// TODO [refactor] Instead of pasting in originalQuote, use the ID

// FIXME []
// Exclude quotes which are less than 4 words long and or contain a url for fill-the-quote

// FIXME []
// Filtering quotes down crashes

// TODO
// Figure out how to split state between the host and all the guests
// https://github.com/antfu/vite-plugin-vue-server-ref

export const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard']
export const gamemodeOptions = [
  { value: 'guess-the-quotee', label: 'Guess The Quotee' },
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
      roundIndex: 0,
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

  function setPlayerState(username: string, key: keyof Player, value: ValueOf<Player>) {
    const index = players.value.findIndex(p => p.username === username)
    Reflect.set(players.value[index], key, value)
  }

  function insertFragment() {
    fragments.value.push({
      gamemode: 'guess-the-quotee',
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
      const pool = [...state.quotePool]

      // Iterate over fragments
      for (const fragment of fragments.value) {
        for (let i = 0; i < fragment.rounds; i++) {
          // Get first quote from the pool
          const quoteId = pool.shift()
          const quote = quotes.getQuoteById(quoteId)

          if (!quote)
            continue

          transformed.push(
            transformQuote(
              quote,
              fragment.gamemode,
              fragment.difficulty,
              fragment.roundTime,
            ),
          )
        }
      }
    }
    else {
      // Split amount of rounds by the amount of gamemodes
      const gamemdes = shuffle(gamemodeIds)

      const groups = arrayIntoChunks(
        [...state.quotePool],
        gamemodeAmount,
      )

      const difficulty = cfg.difficulty

      groups.forEach((group, index) => {
        for (const quoteId of group) {
          const quote = quotes.getQuoteById(quoteId)

          if (!quote)
            continue

          transformed.push(
            transformQuote(
              quote,
              gamemdes[index],
              difficulty,
              cfg.globalRoundLength,
            ),
          )
        }
      })
    }

    state.transformedPool = transformed

    return transformed
  }

  // Takes in a raw quote and returns a transformed Task
  function transformQuote(quote: Quote, type: Gamemode, difficulty: Difficulty, time: number): RoundTypes {
    // Select relevant quote fragment
    const selectedFragment = orderBy(quote.fragments, ['type', 'highlight'], ['desc', 'desc'])[0]
    const { content, quotee } = selectedFragment
    // Index of the selected fragment in the original quote
    const fragmentIndex = quote.fragments.findIndex(f => f.content === selectedFragment.content)

    // Based on difficulty
    // index of Easy is 0 (+1) deems 1 iteration and so on
    let len = difficultyOptions.indexOf(difficulty) + 1

    switch (type) {
      case 'fill-the-quote': {
        // Take the quote and based on difficulty extract 1-3 words from it
        const answers: Set<number> = new Set()
        const words = content.trim().split(/\s+/)

        while (answers.size !== len)
          answers.add(getRanMinMax(0, words.length - 1))

        return {
          originalQuote: quote,
          fragmentIndex,
          time,
          answers: [...answers],
          words,
          difficulty,
          type: 'fill-the-quote',
        }
      }
      case 'guess-the-author': {
        const users = useUser()
        const answer = quote.author

        // Slightly increase difficulty when you only have to choose a user
        len *= 2

        const options = new Set<string>()
        const cloned = [...users.users].filter(user => user.username !== answer)

        // Add the answer
        options.add(answer)

        while (options.size !== len)
          options.add(cloned[getRanMinMax(0, cloned.length - 1)].username)

        return {
          answer,
          options: shuffle([...options]),
          originalQuote: quote,
          time,
          difficulty,
          type: 'guess-the-author',
        }
      }

      case 'guess-the-quotee': {
        const users = useUser()

        // Slightly increase difficulty when you only have to choose a user
        len *= 2

        const options = new Set<string>()
        const cloned = [...users.users].filter(user => user.username !== quotee)

        // Add the answer
        options.add(quotee)

        while (options.size !== len)
          options.add(cloned[getRanMinMax(0, cloned.length - 1)].username)

        return {
          options: shuffle([...options]),
          answer: quotee,
          fragmentIndex,
          originalQuote: quote,
          time,
          difficulty,
          type: 'guess-the-quotee',
        }
      }
    }
  }

  /**
   * Computed properties
   */

  // This is used to check if players are ready to start the game
  // Same property can also be used in game, if everyone answers before time runs out
  // and clicks the "final answer" button, it will lock in their answer and set them as ready
  // TODO: make sure the ready state is cleared after 'setup' and also after each round ends
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
    setPlayerState,
    transformQuotes,
    createQuotePool,
    isEveryoneReady,
  }
})
