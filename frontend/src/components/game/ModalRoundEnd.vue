<script setup lang='ts'>
import Countdown from '@chenfengyuan/vue-countdown'
import dayjs from 'dayjs'
import { Player } from '../../types/game-types'
import type { RoundPoints } from '../../types/game-types'
import { useGame } from '../../store/game'
import PlayerIngame from './PlayerIngame.vue'

const props = defineProps<{ results: RoundPoints[] }>()
const game = useGame()

const timer = dayjs.utc().add(game.TRANSITION_DELAY_S - 1, 'second').diff(Date.now())
</script>

<template>
  <div class="quote-container-small game-transition-modal">
    <div class="modal-content">
      <h3>Round {{ game.state.roundIndex + 1 }}</h3>

      <div class="game-user-wrap">
        <template v-for="(item, index) in props.results" :key="item.username">
          <span class="rank">#{{ index + 1 }}</span>
          <PlayerIngame
            class="in-modal"
            :player="{
              score: item.score,
              username: item.username,
              // Considering PlayerInagme only uses score and username
              //we can type cast it here
            } as Player"
            :difference="item.score - item.scoreBefore"
          />
        </template>
      </div>

      <hr>

      <p>
        Next round in
        <Countdown v-slot="{ seconds }" :time="timer">
          {{ seconds }}
        </Countdown> seconds
      </p>

      <!-- <pre>{{ props.results }}</pre> -->
    </div>
  </div>
</template>
