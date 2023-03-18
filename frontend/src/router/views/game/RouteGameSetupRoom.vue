<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import InputSelect from '../../../components/form/InputSelect.vue'
import InputText from '../../../components/form/InputText.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'

import { useToast } from '../../../store/toast'
import { difficultyOptions, useGame } from '../../../store/game'
import Player from '../../../components/game/Player.vue'
import InputCheckbox from '../../../components/form/InputCheckbox.vue'
import { useQuote } from '../../../store/quote'
import { useFilters } from '../../../store/filters'
import Fragment from '../../../components/game/Fragment.vue'
import { delay } from '../../../bin/utils'

const quote = useQuote()
const toast = useToast()
const game = useGame()
const filters = useFilters()
const router = useRouter()

function inviteUser() {
  toast.push({
    type: 'info',
    message: 'Invite link copied to clipboard.',
  })
}

function resetGameSettings() {
  filters.clear()
  game.resetConfig()
}

const START_IN = 3

const countdown = ref(START_IN)
const isStarting = ref(false)
async function startGame() {
  if (isStarting.value)
    return

  isStarting.value = true

  // Get the quote pool
  game.createQuotePool()
  game.transformQuotes()

  // Count down
  for (let i = START_IN; i > 0; i--) {
    await delay(10)
    countdown.value--

    if (countdown.value === 0) {
      // Redirect to new game and stuff
      game.state.stage = 'running'

      router.push({
        name: 'RouteGameInProgress',
        params: {
          id: game.state.gameId,
        },
      })
    }
  }
}
</script>

<template>
  <div class="game-configure">
    <div>
      <div class="col col-players">
        <div class="col-header">
          <strong>Players</strong>

          <button class="button btn-highlight-text" @click="inviteUser">
            <Icon code="e7fe" size="1.6" />
            Invite
          </button>
        </div>

        <div class="col-content">
          <Player v-for="user in game.players" :key="user.username" :username="user.username" />
        </div>
      </div>
    </div>

    <div class="col col-configure">
      <div class="col-header">
        <strong>Gamae Settings</strong>
        <button class="button btn-white" @click="resetGameSettings()">
          Reset
        </button>
      </div>

      <div class="col-content">
        <div class="content-cell">
          <label>Max players</label>
          <InputText v-model:value="game.cfg.maxPlayerCount" type="number" min="2" />
        </div>

        <div class="content-cell">
          <label>Game Difficulty</label>
          <InputSelect v-model:selected="game.cfg.difficulty" :options="difficultyOptions" />
        </div>
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Quote Pool</strong>
          <InputCheckbox v-model:check="game.cfg.useCustomPool" label="Customize" class="reversed button btn-white" />
        </div>

        <QuoteFilters v-if="game.cfg.useCustomPool" />
        <p v-else>
          Using all ({{ quote.quotes.length }}) existing quotes.
        </p>
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Composition</strong>
          <InputCheckbox v-model:check="game.cfg.useCustomComposition" label="Customize" class="reversed button btn-white" />
        </div>

        <div v-if="game.cfg.useCustomComposition" class="composition">
          <div v-if="game.fragments.length > 0" class="composition-list">
            <Fragment
              v-for="(fragment, index) in game.fragments"
              :key="index + fragment.gamemode"
              :fragment="fragment"
              :index="index"
            />
          </div>

          <div class="flex-wrap ">
            <button class="button btn-gray regular" @click="game.insertFragment()">
              <Icon code="e145" size="1.4" />
              Add Round
            </button>
          </div>
        </div>

        <template v-else>
          <div class="content-cell">
            <label>Rounds</label>
            <InputText v-model:value="game.cfg.rounds" type="number" min="1" />
          </div>
          <div class="content-cell">
            <label>Time limit per round (seconds)</label>
            <InputText v-model:value="game.cfg.globalRoundLength" type="number" min="5" />
          </div>
        </template>
      </div>

      <div class="col-content">
        <!-- Game summary -->
        <ul>
          <li>Total amount of rounds</li>
          <li>Total play time (+ delay seconds between rounds)</li>
          <li>Amount of players</li>
        </ul>
        <br><br>
        <button class="button btn-highlight btn-full btn-large" @click="startGame()">
          {{ isStarting ? `Starting in ${countdown}` : 'Start Game' }}
        </button>
        <br><br>
      </div>
    </div>
  </div>
</template>
