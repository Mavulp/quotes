<script setup lang="ts">
import { computed, ref } from "vue"
const username = computed(() => "dolanske")

const show = ref(true)

document.addEventListener("scroll", () => {
  show.value = window.scrollY <= 5
})
</script>

<template>
  <div class="quote-navigation" :class="{ 'show-border': show }">
    <router-link class="logo" :to="{ name: 'Home' }">
      <img src="/quotes-logo.svg" alt="" />
    </router-link>

    <div class="quote-container">
      <router-link class="header-link" :to="{ name: 'Home' }">Home</router-link>
      <router-link class="header-link" :to="{ name: 'QuoteList' }">Quotes</router-link>
      <router-link class="header-link" :to="{ name: 'Admin' }">Admin</router-link>
      <router-link class="header-link" :to="{ name: 'QuoteAdd' }">
        <Icon code="e745" /> Create
      </router-link>

      <div style="flex: 1"></div>

      <router-link
        data-title-bottom="Your quotes"
        class="header-link header-user"
        :to="{ name: 'UserProfile', params: { username: username } }"
      >
        <Icon code="e7fd" />
        {{ username }}
      </router-link>
    </div>
  </div>
</template>
