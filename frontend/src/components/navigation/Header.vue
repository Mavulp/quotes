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
  <div
    class="quote-navigation"
    :class="{
      'disable-border': show,
      'disable-navigation': route.name === 'RouteHome' || !user.signedIn,
    }"
  >
    <div class="quote-container container-header">
      <router-link class="logo" :to="{ name: 'RouteHome' }">
        <img src="/logo.svg" alt="">
      </router-link>

      <router-link class="header-link" :to="{ name: 'RouteHome' }">
        Home
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteQuoteList' }">
        Quotes
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteTags' }">
        Tags
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteStatistics' }">
        Statistics
      </router-link>

      <router-link class="header-link" :to="{ name: 'RouteUsers' }">
        Users
      </router-link>

      <router-link class="header-link" :to="{ name: 'RouteGame' }">
        Game
      </router-link>
      <!-- <router-link class="header-link" :to="{ name: 'RouteAdmin' }">
        Admin
      </router-link> -->

      <div style="flex: 1" />

      <router-link class="header-link post button btn-white" :to="{ name: 'RouteQuoteAdd' }">
        <Icon code="e745" /> Post
      </router-link>

      <router-link
        v-if="profile.username"
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
