import type { Player, RoundFillQuote, RoundGuessQuotee } from '../../types/game-types'

export const MOCK_ROUND_FILL: RoundFillQuote = {
  originalQuote: {
    id: 571,
    author: 'Jokler',
    offensive: true,
    indices: [
      {
        quotee: 'tmtu',
        index: 112,
      },
    ],
    fragments: [
      {
        type: 'text',
        highlight: true,
        content: '[That might not be what you said but] that is what I heard',
        quotee: 'tmtu',
      },
    ],
    tags: [
      'legacy',
    ],
    createdAt: 1563822564,
  },
  fragmentIndex: 0,
  time: 30,
  answers: [
    4,
    10,
  ],
  words: [
    '[That',
    'might',
    'not',
    'be',
    'what',
    'you',
    'said',
    'but]',
    'that',
    'is',
    'what',
    'I',
    'heard',
  ],
  difficulty: 'Medium',
  type: 'fill-the-quote',
}

export const MOCK_PLAYER: Player = {
  username: 'tester',
  score: 0,
  ready: false,
  _input: null,
  _inputTimestamp: -1,
}

export const MOCK_ROUND_QUOTEE: RoundGuessQuotee = {
  options: [
    'UNKNOWN',
    'tmtu',
    'Frank',
    'kilmanio',
  ],
  answer: 'tmtu',
  fragmentIndex: 0,
  originalQuote: {
    id: 1081,
    author: 'Jokler',
    offensive: true,
    indices: [
      {
        quotee: 'tmtu',
        index: 169,
      },
    ],
    fragments: [
      {
        type: 'text',
        highlight: true,
        content: '[Marina sounds extra slutty today] Truer words have never been spoken.',
        quotee: 'tmtu',
      },
    ],
    tags: [
      'legacy',
    ],
    createdAt: 1581619013,
  },
  time: 30,
  difficulty: 'Medium',
  type: 'guess-the-quotee',
}
