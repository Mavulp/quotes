import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'
import { useGame } from '../../store/game'
import { MOCK_PLAYER } from './mocks'

describe('Functionality pertaining to players', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('Inserting new player', () => {
    const game = useGame()
    game.addPlayer('tester')
    expect(game.players[0]).toStrictEqual(MOCK_PLAYER)
  })

  test('Setting player state', () => {
    const game = useGame()
    game.addPlayer('tester')
    game.setPlayerState('tester', 'ready', true)
    expect(game.players[0].ready).toBeTruthy()
  })
})
