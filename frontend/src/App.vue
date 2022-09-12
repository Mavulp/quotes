<script setup lang="ts">
import "./style/index.scss"

import Sidebar from "./components/navigation/Sidebar.vue"
import Header from "./components/navigation/Header.vue"
</script>

<template>
  <div class="quote-app">
    <!-- <Sidebar /> -->

    <Header />

    <div class="quote-content-wrap">
      <router-view v-slot="{ Component }">
        <transition name="tab" mode="out-in">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </div>
  </div>
</template>
