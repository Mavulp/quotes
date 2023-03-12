<script setup lang='ts'>
import { reactive, ref } from 'vue'
import { getRndGradient } from '../../../bin/color'
import InputSelect from '../../../components/form/InputSelect.vue'
import InputText from '../../../components/form/InputText.vue'
import QuoteFilters from '../../../components/quotes/filters/QuoteFilters.vue'
import InputSwitch from '../../../components/form/InputSwitch.vue'

import { useToast } from '../../../store/toast'
import { useUser } from '../../../store/user'

const users = useUser()
const toast = useToast()

function inviteUser() {
  toast.push({
    type: 'info',
    message: 'Invite link copied to clipboard.',
  })
}

const useCustomPool = ref(false)

const cfg = reactive({
  players: 8,
  roundLength: 30,
  difficulty: 'Easy',
})

const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Insane']

const useCustomGame = ref(false)
</script>

<template>
  <div class="game-configure">
    <div class="col col-players">
      <div class="col-header">
        <strong>Players</strong>

        <button class="button btn-highlight-text" @click="inviteUser">
          <Icon code="e7fe" size="1.6" />
          Invite
        </button>
      </div>

      <div class="col-content">
        <div v-for="user in users.users.slice(0, 10)" :key="user.username" class="game-user">
          <div class="image-wrap">
            <img v-if="user.profilePicture" :src="user.profilePicture">
            <div v-else :style="{ backgroundColor: getRndGradient() }">
              {{ user.username[0] }}
            </div>
          </div>

          <span>{{ user.username }}</span>

          <div class="user-attrs">
            <button class="button btn-gray btn-round" data-title-top="Kick user">
              <Icon code="ef66" size="2" />
            </button>

            <button class="button btn-gray btn-round" data-title-top="Make Admin">
              <Icon code="ea3d" size="2" />
            </button>
          </div>
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
          <InputText v-model="cfg.players" type="number" min="2" />
        </div>
        <div class="content-cell">
          <label>Round Length (seconds)</label>
          <InputText v-model="cfg.roundLength" type="number" min="5" />
        </div>
        <div class="content-cell">
          <label>Game Difficulty</label>
          <InputSelect v-model:selected="cfg.difficulty" :options="difficultyOptions" />
        </div>
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Quote Pool</strong>
          <InputSwitch v-model="useCustomPool" off="Use all quotes" on="Custom pool" />
        </div>

        <QuoteFilters v-if="useCustomPool" />
      </div>

      <div class="col-content">
        <div class="col-title">
          <strong>Rounds</strong>
          <InputSwitch v-model="useCustomGame" off="Randomize game" on="Custom game" />
        </div>
      </div>
    </div>
    game created (in of game in url), waiting to start

    (opening this page with the link will automatically register you unless you already are)

    this is where we list users and create
  </div>
</template>
