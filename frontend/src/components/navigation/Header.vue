<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUser } from '../../store/user'

const route = useRoute()
const username = computed(() => 'dolanske')
const show = ref(true)

document.addEventListener('scroll', () => {
  show.value = window.scrollY <= 5
})
</script>

<template>
  <div class="quote-navigation" :class="{ 'disable-border': show }">
    <router-link class="logo" :to="{ name: 'RouteHome' }">
      <img src="/quotes-logo.svg" alt="">
    </router-link>

    <div class="quote-container">
      <router-link class="header-link" :to="{ name: 'RouteHome' }">
        Home
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteQuoteList' }">
        Quotes
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteAdmin' }">
        Admin
      </router-link>
      <router-link class="header-link" :to="{ name: 'RouteQuoteAdd' }">
        <Icon code="e745" /> Create
      </router-link>

      <div style="flex: 1" />

      <router-link
        data-title-bottom="Your quotes"
        class="header-link header-user"
        :to="{ name: 'RouteUserProfile', params: { username } }"
      >
        <Icon code="e7fd" />
        {{ username }}
      </router-link>
    </div>
  </div>
</template>
