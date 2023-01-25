<script setup lang="ts">
import './style/index.scss'

import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { until } from '@vueuse/shared'
import Header from './components/navigation/Header.vue'
import ToastWrap from './components/ToastWrap.vue'
import { useUser } from './store/user'
import { useQuote } from './store/quote'
import { useLoading } from './store/loading'

const route = useRoute()
const loading = useLoading()
const quotes = useQuote()
const user = useUser()

onMounted(async () => {
  await until(() => user.signedIn).toBe(true)

  user.fetchUsers()
  quotes.fetchQuotes()
})
</script>

<template>
  <div class="quote-app">
    <Header v-if="user.signedIn && !loading.get('users')" />

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
