import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import type { GameState, Player } from '../types/game-types'

export const useGame = defineStore('game', () => {
  const state = reactive({} as GameState)
  // const rounds = ref()
  // const players = ref<Player[]>([])

  return {
    state,
  }
})
