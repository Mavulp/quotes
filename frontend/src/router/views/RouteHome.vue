<script setup lang="ts">
//

import { computed } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { displayDateLong } from '../../bin/time'
import { useUser } from '../../store/user'
import { useQuote } from '../../store/quote'
import Modal from '../../components/Modal.vue'

const quote = useQuote()
const router = useRouter()
const user = useUser()

// const profile = computed(() => user.user)

function random() {
  const id = quote.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}

// Prompt to understand funny
const open = useLocalStorage('quotes_funny_prompt', true)
</script>

<template>
  <div class="quote-home">
    <Modal v-if="open" @close="open = false">
      <div class="quote-container-small">
        <div class="modal-content modal-conditions">
          <h1>Content Agreement</h1>

          <p>I understand that humor is subjective and out of context statements made do not necessarily reflect the views of those involved</p>
          <p>I also acknowledge that what is funny yesterday may not be tomorrow. I will bring some salt.</p>

          <button style="margin:0 auto" class="button btn-large" @click="open = false">
            Acknowledge
          </button>
        </div>
      </div>
    </Modal>

    <Transition name="fade" appear>
      <img src="/bg/blobs.svg" class="bg" alt="">
    </Transition>

    <!-- <nav>
      <ul>
        <li>
          <router-link :to="{ name: 'RouteQuoteList' }">
            Quotes
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'RouteTags' }">
            Tags
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'RouteStatistics' }">
            Statistics
          </router-link>
        </li>
        <li>
          <router-link class="header-post" :to="{ name: 'RouteQuoteAdd' }">
            <Icon code="e745" /> Post
          </router-link>
        </li>
        <li>
          <router-link
            v-if="profile.username"
            class="header-link header-user"
            :to="{ name: 'RouteUserProfile', params: { username: profile.username } }"
          >
            <img v-if="profile.profilePicture" :src="profile.profilePicture">
            <Icon v-else code="e7fd" />
            {{ profile.username }}
          </router-link>
        </li>
      </ul>
    </nav> -->

    <div class="quote-container">
      <div>
        <h1>Hivecom Quotes</h1>
        <p>A bunch of friends holding each other accountable for the messed up things they said.</p>
        <br>
        <button class="button btn-large btn-highlight" @click="random">
          Random Quote
        </button>
      </div>
      <router-link :to="{ name: 'RouteQuoteList' }" class="quote-example">
        <div class="example-header">
          <span>
            Big Jellyfish
            <b>#27</b>
          </span>
          <div class="dot-padder" />
          <span>reported by <b>Brick</b></span>
          <div class="flex-1" />
          <span>{{ dayjs.utc().format(displayDateLong) }}</span>
        </div>

        <div class="example-content">
          <div class="example-line">
            <strong>What is the difference between a microphone and a jellyfish? hehe.</strong>
            <span><Icon size="1.6" code="e244" />Crab</span>
          </div>
          <div class="example-line highlight">
            <strong>Idk, I am breaking up with you.</strong>

            <span><Icon size="1.6" code="e244" />Big Jellyfish</span>
          </div>
        </div>
      </router-link>
    </div>

    <p class="made-by">
      <Icon size="2" code="e86f" />
      Made by <a href="https://github.com/mavulp" target="_blank">Mavulp</a> in 2023
    </p>
  </div>
</template>
