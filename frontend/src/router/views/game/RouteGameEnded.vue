<script setup lang='ts'>
import { ref } from 'vue'
import { getRanMinMax } from '../../../bin/utils'
import { useGame } from '../../../store/game'
const game = useGame()

const titles = [
  'GG',
  'Good Game',
  'That\'s a wrap!',
  'And that\'s it',
  'Well played.',
  '',
]

const title = titles[getRanMinMax(0, titles.length - 1)]
</script>

<template>
  <div class="game-end">
    <section class="quote-page-header">
      <div class="quote-container">
        <h1>{{ title }}</h1>

        <div class="game-information">
          <div class="cell">
            <strong>Players</strong>
            <p>4</p>
          </div>
          <div class="cell">
            <strong>rounds</strong>
            <p>15</p>
          </div>
          <div class="cell">
            <strong>Gamemodes</strong>
            <p>3</p>
          </div>
          <div class="cell last">
            <strong>Hosted by</strong>
            <p>dolanske</p>
          </div>

          <div class="flex-1" />

          <div class="flex-wrap">
            <button class="button btn-gray" data-title-top="Start a new game">
              Fresh Game
            </button>
            <button class="button btn-highlight" data-title-top="Start a new game with the same settings">
              Replay
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="quote-container">
      <h1>GG</h1>

      <ul>
        <li>
          score (big player lsit)
        </li>
        <li>button or dropdown to show each round with answers, and all the info about the game (when players answered etc)</li>
      </ul>
    </div>

    <!-- <pre>
      {{ game.state }}
    </pre> -->
  </div>
</template>
