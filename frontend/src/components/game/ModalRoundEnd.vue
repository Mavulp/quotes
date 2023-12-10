<script setup lang='ts'>
import Countdown from '@chenfengyuan/vue-countdown'
import dayjs from 'dayjs'
import { Player } from '../../types/game-types'
import type { RoundResults } from '../../types/game-types'
import { useGame } from '../../store/game'
import PlayerIngame from './PlayerIngame.vue'

const props = defineProps<{ results: RoundResults[] }>()
const game = useGame()
const round = game.state.transformedPool[game.state.roundIndex]
const timer = dayjs.utc().add(game.TRANSITION_DELAY_S - 1 + game.players.length, 'second').diff(Date.now())
</script>

<template>
  <div class="quote-container-small game-transition-modal">
    <div class="modal-content">
      <h3>Round {{ game.state.roundIndex + 1 }}</h3>

      <div class="game-modal-question">
        <!-- Fill the quote -->
        <template v-if="round.type === 'fill-the-quote'">
          <span>What {{ round.originalQuote.fragments[round.fragmentIndex].quotee }} actually said...</span>
          <div class="quote-fill-wrap">
            <template v-for="(word, index) in round.words" :key="word">
              <b v-if="round.answers.includes(index)" v-text="word" />
              <span v-else>{{ word }}</span>
            </template>
          </div>
        </template>

        <!-- Guess the author -->
        <template v-else-if="round.type === 'guess-the-author'">
          <div v-for="fragment in round.originalQuote.fragments" :key="fragment.content" class="fragment-author">
            <p>{{ fragment.content }}</p>
            <span class="fragment-quotee">
              <Icon code="e244" size="1.4" />
              {{ fragment.quotee }}
            </span>
          </div>
          <span>The author is...</span>
          <strong>{{ round.originalQuote.author }}</strong>
        </template>

        <!-- Guess the quotee -->
        <template v-else>
          <p>{{ round.originalQuote.fragments[round.fragmentIndex].content }}</p>
          <span>The one who said it is...</span>
          <strong> {{ round.originalQuote.fragments[round.fragmentIndex].quotee }}</strong>
        </template>
      </div>

      <div class="player-list">
        <div v-for="(item, index) in props.results" :key="item.username" class="game-user-wrap">
          <div class="game-user-wrap-inner">
            <span class="rank">#{{ index + 1 }}</span>
            <PlayerIngame
              class="in-modal"
              :player="{
                score: item.score,
                username: item.username,
              // Considering PlayerInagme only uses score and username
              //we can type cast it here
              } as Player"
              :difference="item.score === item.scoreBefore ? 0 : item.score - item.scoreBefore"
            >
              <div class="game-user-answer">
                <span v-if="item.answers.every(a => !a.input)">No answer</span>
                <template v-else>
                  <span>Answered:</span>
                  <span v-for="answer in item.answers" :key="answer.input" :class="[answer.correct ? 'green' : 'red']">
                    {{ answer.input }}
                  </span>
                </template>
              </div>
            </PlayerIngame>
          </div>
        </div>
      </div>
      <hr>
      <p>
        Next round in
        <Countdown v-slot="{ seconds }" :time="timer">
          {{ seconds }}
        </Countdown> seconds
      </p>
    </div>
  </div>
</template>
