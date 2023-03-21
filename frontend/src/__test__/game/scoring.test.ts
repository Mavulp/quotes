import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'
import { useGame } from '../../store/game'
import { MOCK_PLAYER, MOCK_ROUND_FILL, MOCK_ROUND_QUOTEE } from './mocks'

describe('Iterate over provided answers and assign poinst to plays', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('Validate simple answer', () => {
    const game = useGame()
    const player = {
      ...MOCK_PLAYER,
      _input: 'tmtu',
    }
    const result = game.validateAnswer(player, MOCK_ROUND_QUOTEE)
    expect(result).toStrictEqual([{
      input: 'tmtu',
      correct: true,
    }])
  })

  test('Validate complex answer', () => {
    const game = useGame()
    const player = {
      ...MOCK_PLAYER,
      _input: {
        4: 'what',
        10: 'that',
      },
    }
    const result = game.validateAnswer(player, MOCK_ROUND_FILL)
    expect(result).toStrictEqual([
      {
        input: 'what',
        correct: true,
      },
      {
        input: 'that',
        correct: false,
      },
    ])
  })

  test('Validate player answers', () => {
    const game = useGame()

    const players = [
      {
        // Answered second, is right
        ...MOCK_PLAYER,
        username: 'Anna',
        _input: 'tmtu',
        _inputTimestamp: Date.now() - 100,
        score: 50,
      },
      // Answered last, is right
      {
        ...MOCK_PLAYER,
        username: 'Jeniffer',
        _input: 'tmtu',
        _inputTimestamp: Date.now(),
        score: 0,
      },
      // Answered first, is wrong
      {
        ...MOCK_PLAYER,
        username: 'Pamela',
        _input: 'Franku',
        _inputTimestamp: Date.now() - 300,
        score: 200,
      },
      // Answered last, is wrong
      {
        ...MOCK_PLAYER,
        username: 'Daniel',
        _input: null,
        _inputTimestamp: Date.now(),
        score: 100,
      },
    ]

    const results = game.validatePlayerAnswers(players, MOCK_ROUND_QUOTEE)
    expect(results).toMatchSnapshot()
  })
})
