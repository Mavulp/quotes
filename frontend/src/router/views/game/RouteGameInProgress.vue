<script setup lang='ts'>
import { log } from 'console'
import Countdown from '@chenfengyuan/vue-countdown'
import dayjs from 'dayjs'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { delay, padTo2Digits } from '../../../bin/utils'
import { gamemodeOptions, useGame } from '../../../store/game'
import PlayerIngame from '../../../components/game/PlayerIngame.vue'

import FillTheQuote from '../../../components/game/fragments/FillTheQuote.vue'
import GuessTheAuthor from '../../../components/game/fragments/GuessTheAuthor.vue'
import GuessTheQuotee from '../../../components/game/fragments/GuessTheQuotee.vue'
import type { Gamemode, RoundPoints } from '../../../types/game-types'
import Modal from '../../../components/Modal.vue'
import ModalRoundEnd from '../../../components/game/ModalRoundEnd.vue'

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

onBeforeMount(resetTimer)

const storedResults = ref<RoundPoints[]>()

function endRound() {
  // This check is here because when timer runs out, it will try to call this method even
  // if the round end has already been called before
  if (game.state.stage === 'transition')
    return

  game.state.stage = 'transition'

  // 1. Count all player score
  const results = game.validatePlayerAnswers(game.players, round.value)
  storedResults.value = results

  // 2. Save round to history
  game.addHistoryEntry(round.value, results)

  // End of the game, perform different logic
  // TODO: enable later
  // if (game.state.roundIndex === game.state.quotePool.size - 1) {
  //   console.log('GAME ENDED LOL')
  //   return
  // }

  // 3. Display result modal
  // Show modal with results and wait the transition delay
  delay(1000 * game.TRANSITION_DELAY_S)
    .then(() => {
      // Execute all code which goes to the next round
      // 4. Reset everything and start a new round
      game.resetPlayersAtRoundEnd()
      resetTimer()
      game.state.roundIndex++
      game.state.stage = 'running'
      storedResults.value = undefined
    })
}
</script>

<template>
  <div class="game-running">
    <Transition name="fade" mode="out-in">
      <Modal v-if="game.state.stage === 'transition' && storedResults" :disable-close-button="true">
        <ModalRoundEnd :results="storedResults" />
      </Modal>
    </Transition>

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
        <PlayerIngame v-for="player in sortedPlayers" :key="player.username" class="in-game" :player="player" />
      </div>
    </div>
  </div>
</template>
