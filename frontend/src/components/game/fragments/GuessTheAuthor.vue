<script setup lang='ts'>
import { computed, ref } from 'vue'
import { useGame } from '../../../store/game'
import { useUser } from '../../../store/user'
import type { Player, RoundGuessAuthor } from '../../../types/game-types'

const props = defineProps<{
  round: RoundGuessAuthor
}>()
const game = useGame()
const user = useUser()
const player = computed(() => game.players.find(p => p.username === user.username) as Player)
</script>

<template>
  <div class="game-fragment guess-the-author">
    <p class="gamemode-title">
      Guess who posted this quote?
    </p>

    <div v-for="fragment in props.round.originalQuote.fragments" :key="fragment.content" class="fragment-parts">
      <p>{{ fragment.content }}</p>
      <span>
        <Icon code="e244" size="1.4" />
        {{ fragment.quotee }}
      </span>
    </div>

    <div class="fragment-options" :class="{ 'is-locked': player.ready }">
      <button
        v-for="option in props.round.options" :key="option" class="button btn-large btn-gray"
        :class="{ 'btn-highlight': player._input === option }"
        @click="game.setPlayerState(user.username, '_input', option)"
      >
        {{ option }}
      </button>
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
