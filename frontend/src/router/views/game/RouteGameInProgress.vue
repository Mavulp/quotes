<script setup lang='ts'>
import Countdown from '@chenfengyuan/vue-countdown'
import dayjs from 'dayjs'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { padTo2Digits } from '../../../bin/utils'
import { gamemodeOptions, useGame } from '../../../store/game'
import PlayerIngame from '../../../components/game/PlayerIngame.vue'

import FillTheQuote from '../../../components/game/fragments/FillTheQuote.vue'
import GuessTheAuthor from '../../../components/game/fragments/GuessTheAuthor.vue'
import GuessTheQuotee from '../../../components/game/fragments/GuessTheQuotee.vue'
import type { Gamemode } from '../../../types/game-types'

const components: Record<Gamemode, Component> = {
  'fill-the-quote': FillTheQuote,
  'guess-the-author': GuessTheAuthor,
  'guess-the-quotee': GuessTheQuotee,
}

const game = useGame()

/**
 * UI
 *
 * Have a wrapper (this route)
 * And a dynamic component, which is just a different fragment based on the gamemode
 */

const round = computed(() => game.state.transformedPool[game.state.roundIndex])
const sortedPlayers = computed(() => [...game.players].sort((a, b) => a.score > b.score ? -1 : 1))
const gamemodeName = computed(() => gamemodeOptions.find(option => option.value === round.value.type))

/**
 * Round ended
 */
watch(() => game.arePlayersReady, endRound)

const timer = ref<number>()

function resetTimer() {
  timer.value = dayjs.utc().add(round.value.time, 'second').diff(Date.now())
}

onMounted(() => {
  resetTimer()
})

function endRound() {
  console.log('Called end round')
  // This check is here because when timer runs out, it will try to call this method even
  // if the round end has already been called before
  if (game.state.stage === 'transition')
    return

  game.state.stage = 'transition'

  // 1. Count all player score
  const results = game.validatePlayerAnswers(game.players, round.value)

  // 2. Save round to history

  // 3. Display result modal

  // Show modal with results
  // Wait 10 seconds

  // 4. Reset everything and start a new round
  //  reset player input
  game.resetPlayrsAtRoundEnd()
  //  Update game state
  game.state.roundIndex++
  game.state.stage = 'running'
}
</script>

<template>
  <div class="game-running">
    <div class="game-container">
      <div class="header">
        <strong class="title highlight">{{ gamemodeName?.label }}</strong>
        <strong class="title">Round {{ game.state.roundIndex + 1 }} / {{ game.state.quotePool.size }}</strong>
        <Countdown
          v-slot="{ minutes, seconds }"
          :time="timer"
          @end="endRound()"
        >
          {{ padTo2Digits(minutes) }}:{{ padTo2Digits(seconds) }}
        </Countdown>
      </div>

      <div class="fragment">
        <component
          :is="components[round.type]"
          :round="round"
        />
      </div>
    </div>
    <div>
      <div class="game-players">
        <strong class="title highlight">Players</strong>
        <PlayerIngame v-for="player in sortedPlayers" :key="player.username" :player="player" />
      </div>
    </div>
  </div>
</template>
