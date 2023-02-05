<script setup lang="ts">
//

import { computed } from 'vue'
import dayjs from 'dayjs'
import { displayDateLong } from '../../bin/time'
import BackgroundBlob from '../../components/BackgroundBlob.vue'
import { useUser } from '../../store/user'

const user = useUser()

const profile = computed(() => user.user)
</script>

<template>
  <div class="quote-home">
    <img src="/bg/blobs.svg" class="bg" alt="">

    <nav>
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
    </nav>

    <div class="quote-container">
      <div>
        <h1>Hivecom Quotes</h1>
        <p>A bunch of friends holding each other accountable for the messed up things they said.</p>
        <br>
        <button class="button btn-large btn-highlight">
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
      <!-- <BackgroundBlob /> -->
    </div>

    <p class="made-by">
      <Icon size="2" code="e86f" />
      Made by <a href="https://github.com/mavulp" target="_blank">Mavulp</a> in 2023
    </p>
  </div>
</template>
