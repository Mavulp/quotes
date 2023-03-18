<script setup lang='ts'>
import { computed, reactive, ref, watch } from 'vue'
import type { Player, RoundFillQuote } from '../../../types/game-types'
import { useGame } from '../../../store/game'
import { useUser } from '../../../store/user'

const props = defineProps<{
  round: RoundFillQuote
}>()
const game = useGame()
const user = useUser()
const input = reactive<Record<number, string>>({})
const relevantFragment = computed(() => props.round.originalQuote.fragments[props.round.fragmentIndex])
const player = computed(() => game.players.find(p => p.username === user.username) as Player)

watch(input, (value) => {
  player.value._input = value
}, { deep: true })
</script>

<template>
  <div class="game-fragment fill-the-quote">
    <p class="gamemode-title">
      Fill in the gaps
    </p>

    <div class="task" :class="{ 'is-locked': player.ready }">
      <div class="task-wrap">
        <template v-for="(word, index) in props.round.words" :key="word">
          <!-- <span v-if=""></span> -->
          <input v-if="props.round.answers.includes(index)" v-model="input[index]" type="text">
          <span v-else>{{ word }}</span>
        </template>
      </div>
      <span class="fragment-quotee">
        <Icon code="e244" size="1.4" />
        {{ relevantFragment.quotee }}
      </span>
    </div>

    <button
      :style="{ visibility: player._input ? 'visible' : 'hidden' }"
      class="button btn-ready"
      :class="[player.ready ? 'btn-highlight-text' : 'btn-white']"
      @click="game.setPlayerState(user.username, 'ready', true)"
    >
      <Icon v-if="player.ready" code="e876" size="1.6" />
      {{ player.ready ? "Answer locked in" : "I am ready" }}
    </button>
  </div>
</template>
