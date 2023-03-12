import type { Quote } from './quote-types'

export interface GameState {
  admin: number
  paused: boolean
  stage: 'setup' | 'running' | 'ended'
  pool: Quote[]
}

export interface Player {
  id: number
  score: number
  admin?: boolean
}

type Gamemode = 'guess-the-quote' | 'guess-the-author' | 'fill-the-quote'
type Difficulty = 'easy' | 'medium' | 'hard'

export interface Fragment<T extends Gamemode> {
  type: T
  repeats: number
  roundLength: number

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
