<script setup lang='ts'>
import { computed } from 'vue'
import { difficultyOptions, gamemodeOptions, useGame } from '../../store/game'
import type { Fragment } from '../../types/game-types'
import InputSelect from '../form/InputSelect.vue'
import InputText from '../form/InputText.vue'

const props = defineProps<{
  fragment: Fragment
  index: number
}>()
const game = useGame()

function editKey(key: keyof Fragment) {
  return computed({
    get: () => {
      const f = game.fragments[props.index]
      return Reflect.get(f, key) as string
    },
    set: (value) => {
      const f = game.fragments[props.index]
      Reflect.set(f, key, value)
    },
  })
}

const type = editKey('type')
const rounds = editKey('rounds')
const roundTime = editKey('roundTime')
const difficulty = editKey('difficulty')
</script>

<template>
  <div class="composition-fragment">
    <span class="fragment-number">#{{ props.index + 1 }}</span>

    <button class="remove-fragment button btn-round btn-white" @click="game.removeFragment(props.index)">
      <Icon code="e5cd" size="2" />
    </button>

    <div class="content-cell">
      <label>Gamemode</label>
      <InputSelect v-model:selected="type" :options="gamemodeOptions" />
    </div>

    <div class="content-cell">
      <label>Repeats</label>
      <InputText v-model:value="rounds" type="number" min="1" />
    </div>

    <div class="content-cell">
      <label>Round time limit (seconds)</label>
      <InputText v-model:value="roundTime" type="number" min="5" />
    </div>

    <div class="content-cell">
      <label>Difficulty</label>
      <InputSelect v-model:selected="difficulty" :options="difficultyOptions" />
    </div>
  </div>
</template>
