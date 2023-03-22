<script setup lang='ts'>
import { log } from 'console'
import Countdown from '@chenfengyuan/vue-countdown'
import dayjs from 'dayjs'
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { whenever } from '@vueuse/shared'
import { useRouter } from 'vue-router'
import { delay, padTo2Digits } from '../../../bin/utils'
import { gamemodeOptions, useGame } from '../../../store/game'
import PlayerIngame from '../../../components/game/PlayerIngame.vue'

import FillTheQuote from '../../../components/game/fragments/FillTheQuote.vue'
import GuessTheAuthor from '../../../components/game/fragments/GuessTheAuthor.vue'
import GuessTheQuotee from '../../../components/game/fragments/GuessTheQuotee.vue'
import type { Gamemode, RoundResults } from '../../../types/game-types'
import Modal from '../../../components/Modal.vue'
import ModalRoundEnd from '../../../components/game/ModalRoundEnd.vue'

const components: Record<Gamemode, Component> = {
  'fill-the-quote': FillTheQuote,
  'guess-the-author': GuessTheAuthor,
  'guess-the-quotee': GuessTheQuotee,
}

const router = useRouter()
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
whenever(() => game.arePlayersReady, endRound)

const timer = ref<number>()
function resetTimer() {
  timer.value = dayjs.utc().add(round.value.time, 'second').diff(Date.now())
}
onBeforeMount(resetTimer)

const storedResults = ref<RoundResults[]>()
function endRound() {
  // 1. Count all player score
  const results = game.validatePlayerAnswers(game.players, round.value)
  storedResults.value = results

  // 2. Save round to history
  game.addHistoryEntry(round.value, results)

  // End of the game, perform different logic
  if (game.state.roundIndex === game.state.quotePool.size - 1) {
    game.state.stage = 'ended'
    game.state.endTime = Date.now()

    game.resetPlayersAtRoundEnd()
    router.push({
      name: 'RouteGameEnded',
      params: { id: game.state.gameId },
    })
    return
  }

  game.state.stage = 'transition'

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
    <Modal v-if="game.state.stage === 'transition' && storedResults" :disable-close-button="true">
      <ModalRoundEnd :results="storedResults" />
    </Modal>

    <div class="game-container">
      <div class="header">
        <strong class="title highlight">{{ gamemodeName?.label }}</strong>
        <strong class="title">Round {{ game.state.roundIndex + 1 }} / {{ game.state.quotePool.size }}</strong>
        <Countdown
          v-if="game.state.stage === 'running'"
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
