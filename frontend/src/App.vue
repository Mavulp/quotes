<script setup lang="ts">
import './style/index.scss'

import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import Header from './components/navigation/Header.vue'
import ToastWrap from './components/ToastWrap.vue'
import { useUser } from './store/user'
import { useQuote } from './store/quote'

const route = useRoute()
const quotes = useQuote()
const user = useUser()

onMounted(() => {
  if (user.signedIn)
    user.fetchUsers()
  quotes.fetchQuotes()
})
</script>

<template>
  <div class="quote-app">
    <Header v-if="route.name !== 'RouteAuthorize'" />

    <div class="quote-content-wrap">
      <router-view v-slot="{ Component }">
        <transition name="tab" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <Teleport to="body">
      <ToastWrap />
    </Teleport>
  </div>
</template>
