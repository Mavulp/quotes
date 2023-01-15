<script setup lang="ts">
import './style/index.scss'

import { onBeforeMount } from 'vue'
import { useQuote } from './store/quote'
import { useUser } from './store/user'
import Header from './components/navigation/Header.vue'

const quote = useQuote()
const user = useUser()

onBeforeMount(async () => {
  if (localStorage.getItem('quotes_bearer_token')) {
    user.fetchUsers()
    user.fetchMe()
    user.fetchSettings()
    // quote.fetchQuotes()
  }
})
</script>

<template>
  <div class="quote-app">
    <Header v-if="$route.name !== 'Login'" />

    <div class="quote-content-wrap">
      <router-view v-slot="{ Component }">
        <transition name="tab" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>
