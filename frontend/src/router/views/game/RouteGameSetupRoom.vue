<script setup lang='ts'>
import { reactive, ref } from 'vue'
import { getRndGradient } from '../../../bin/color'
import type { Difficulty } from '../../../types/game-types'
import InputSelect from '../../../components/form/InputSelect.vue'
import InputText from '../../../components/form/InputText.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'
import InputSwitch from '../../../components/form/InputSwitch.vue'

import { useToast } from '../../../store/toast'
import { useUser } from '../../../store/user'
import { useFilters } from '../../../store/filters'
import { useGame } from '../../../store/game'
import Player from '../../../components/game/Player.vue'

const users = useUser()
const toast = useToast()
const game = useGame()
// const filters = useFilters()

function inviteUser() {
  toast.push({
    type: 'info',
    message: 'Invite link copied to clipboard.',
  })
}

const useCustomPool = ref(false)
const difficultyOptions: Difficulty[] = ['Easy', 'Medium', 'Hard']
// const useCustomGame = ref(false)
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
        <button class="button btn-white">
          Reset
        </button>
      </div>

      <div class="col-content">
        <div class="content-cell">
          <label>Max players</label>
          <InputText v-model:value="game.cfg.maxPlayerCount" type="number" min="2" />
        </div>
        <div class="content-cell">
          <label>Round Length (seconds)</label>
          <InputText v-model:value="game.cfg.globalRoundLength" type="number" min="5" />
        </div>
        <div class="content-cell">
          <label>Game Difficulty</label>
          <InputSelect v-model:selected="game.cfg.difficulty" :options="difficultyOptions" />
        </div>
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Quote Pool</strong>
          <InputSwitch v-model="useCustomPool" off="Use all quotes" on="Custom pool" />
        </div>

        <QuoteFilters v-if="game.cfg.useCustomPool" />
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Rounds</strong>
          <InputSwitch v-model="game.cfg.useCustomComposition" off="Randomize game" on="Custom game" />
        </div>
      </div>
    </div>
    game created (in of game in url), waiting to start

    (opening this page with the link will automatically register you unless you already are)

    this is where we list users and create
  </div>
</template>
