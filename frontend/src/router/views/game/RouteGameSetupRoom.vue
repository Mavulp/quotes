<script setup lang='ts'>
import type { Difficulty } from '../../../types/game-types'
import InputSelect from '../../../components/form/InputSelect.vue'
import InputText from '../../../components/form/InputText.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'

import { useToast } from '../../../store/toast'
import { useUser } from '../../../store/user'
import { useGame } from '../../../store/game'
import Player from '../../../components/game/Player.vue'
import InputCheckbox from '../../../components/form/InputCheckbox.vue'
import { useQuote } from '../../../store/quote'
import { useFilters } from '../../../store/filters'

const users = useUser()
const quote = useQuote()
const toast = useToast()
const game = useGame()
const filters = useFilters()

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

const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard']
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
          Using all existing quotes.
        </p>
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Composition</strong>
          <InputCheckbox v-model:check="game.cfg.useCustomComposition" label="Customize" class="reversed button btn-white" />
        </div>

        <template v-if="game.cfg.useCustomComposition" />

        <template v-else>
          <div class="content-cell">
            <label>Rounds</label>
            <InputText v-model:value="game.cfg.rounds" type="number" min="1" />
          </div>
          <div class="content-cell">
            <label>Round Length (seconds)</label>
            <InputText v-model:value="game.cfg.globalRoundLength" type="number" min="5" />
          </div>
        </template>
      </div>

      <div class="col-content">
        <div class="flex-wrap right">
          <button class="button btn-highlight btn-full btn-large" disabled>
            Start Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
