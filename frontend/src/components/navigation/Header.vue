<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from '../../store/user'

const user = useUser()
const route = useRoute()
const show = ref(true)

const profile = computed(() => user.user)

document.addEventListener('scroll', () => {
  show.value = window.scrollY <= 5
})
</script>

<template>
  <div v-if="profile.username" class="quote-navigation" :class="{ 'disable-border': show }">
    <router-link class="logo" :to="{ name: 'RouteHome' }">
      <img src="/logo.svg" alt="">
    </router-link>

    <div class="quote-container container-header">
      <router-link class="header-link" :to="{ name: 'RouteHome' }">
        Home
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteQuoteList' }">
        Quotes
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteStatistics' }">
        Statistics
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteGuessQuote' }">
        Guess The Quote
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteUsers' }">
        Users
      </router-link>
      <!-- <router-link class="header-link" :to="{ name: 'RouteAdmin' }">
        Admin
      </router-link> -->

      <div style="flex: 1" />

      <router-link class="header-link post" :to="{ name: 'RouteQuoteAdd' }">
        <Icon code="e745" /> Post
      </router-link>

      <router-link
        data-title-bottom="Your quotes"
        class="header-link header-user"
        :to="{ name: 'RouteUserProfile', params: { username: profile.username } }"
      >
        <img v-if="profile.profilePicture" :src="profile.profilePicture">
        <Icon v-else code="e7fd" />
        {{ profile.username }}
      </router-link>
    </div>
  </div>
</template>
