<script setup lang='ts'>
import Countdown from '@chenfengyuan/vue-countdown'
import dayjs from 'dayjs'
import { computed } from 'vue'
import { padTo2Digits } from '../../../bin/utils'
import { gamemodeOptions, useGame } from '../../../store/game'
import PlayerIngame from '../../../components/game/PlayerIngame.vue'

const game = useGame()

/**
 * 1. Round starts
 * 2. Wait for round length or until everyone's ready
 * 3. Enter transition round
 * 4. Show everyone's score and the right answer
 * 5. Reset round state and user inputs
 * 6. Increment round index
 */

/**
 * UI
 *
 * Have a wrapper (this route)
 * And a dynamic component, which is just a different fragment based on the gamemode
 */

const round = computed(() => game.state.transformedPool[game.state.roundIndex])
const sortedPlayers = computed(() => [...game.players].sort((a, b) => a.score > b.score ? -1 : 1))
const gamemodeName = computed(() => gamemodeOptions.find(option => option.value === round.value.type))

function finishRound() {
  console.log('lol we done')
}
</script>

<template>
  <div class="game-running">
    <div class="game-container">
      <div class="header">
        <strong class="title highlight">{{ gamemodeName?.label }}</strong>
        <strong class="title">Round {{ game.state.roundIndex + 1 }}</strong>
        <Countdown
          v-slot="{ minutes, seconds }"
          :time="dayjs.utc().add(round.time, 'second').diff(Date.now())"
          @end="finishRound()"
        >
          {{ padTo2Digits(minutes) }}:{{ padTo2Digits(seconds) }}
        </Countdown>
      </div>

      <div class="task" />
    </div>
    <div>
      <div class="game-players">
        <strong class="title highlight">Players</strong>
        <PlayerIngame v-for="player in sortedPlayers" :key="player.username" :player="player" />
      </div>
    </div>
  </div>
</template>
