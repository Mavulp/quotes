import type { Quote } from './quote-types'

export interface GameState {
  gameId: string
  admin: string
  paused: boolean
  stage: 'setup' | 'running' | 'ended' | 'transition'
  quotePool: Set<number>
  transformedPool: RoundTypes[]
  roundIndex: number
}

export interface Player {
  username: string
  score: number
  ready: boolean
  _input: any
  _inputTimestamp: number
}

export interface GameQuote {
  id: number
  played: boolean
}

export type Gamemode = 'guess-the-quotee' | 'guess-the-author' | 'fill-the-quote'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Fragment {
  gamemode: Gamemode
  rounds: number
  roundTime: number
  /**
   * For each gamemode, the difficulty means something else.
   * Some of the core indicators of difficulty should be
   *  - length
   *  - [guess the author] how many times they posted
   *  - [guess the quotee] how many times they were quoted
   * - hardest for guessing: write the username exactly
   * - hardest for fill: write the whole quote except one word
   */
  difficulty: Difficulty
}

export interface Round {
  readonly originalQuote: Quote
  time: number
  difficulty: Difficulty
}

export interface RoundGuessQuotee extends Round {
  answer: string
  fragmentIndex: number
  options: string[]
  type: 'guess-the-quotee'
}

export interface RoundGuessAuthor extends Round {
  answer: string
  options: string[]
  type: 'guess-the-author'
}

export interface RoundFillQuote extends Round {
  answers: number[]
  words: string[]
  fragmentIndex: number
  type: 'fill-the-quote'
}

export type RoundTypes = RoundGuessQuotee | RoundGuessAuthor | RoundFillQuote

export interface History {
  id: string
  players: Omit<Omit<Player, '_input'>, '_inputTimestamp'>[]
}
