<script setup lang="ts">
import './style/index.scss'

import { useRoute } from 'vue-router'
import Header from './components/navigation/Header.vue'

const route = useRoute()
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
  </div>
</template>
