<script setup lang="ts">
import './style/index.scss'

import { useRouter } from 'vue-router'
import { onBeforeMount } from 'vue'
import { until } from '@vueuse/shared'
import Header from './components/navigation/Header.vue'
import ToastWrap from './components/ToastWrap.vue'
import { useUser } from './store/user'
import { useQuote } from './store/quote'
import { useLoading } from './store/loading'

// const route = useRoute()
const router = useRouter()
const loading = useLoading()
const quotes = useQuote()
const user = useUser()

onBeforeMount(async () => {
  await until(() => user.signedIn).toBe(true)

  user.fetchUsers()
  quotes.fetchQuotes()

  document.addEventListener('click', (e: any) => {
    const attr = e.target.attributes['data-title-link']

    if (attr) {
      e.preventDefault()
      router.push({
        name: 'RouteUserProfile',
        params: { username: attr.value },
      })
    }
  })
})
</script>

<template>
  <div class="quote-app">
    <Spinner v-if="loading.get('app-loading')" />
    <template v-else>
      <Header />

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
    </template>
  </div>
</template>
