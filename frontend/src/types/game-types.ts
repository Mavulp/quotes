import type { Quote } from './quote-types'

export interface GameState {
  gameId: string
  admin: string
  paused: boolean
  stage: 'setup' | 'running' | 'ended'
  quotePool: Quote[]
}

export interface Player {
  username: string
  score: number
  ready: boolean
}

export type Gamemode = 'guess-the-quote' | 'guess-the-author' | 'fill-the-quote'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface Fragment {
  type: Gamemode
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
