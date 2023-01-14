<script setup lang="ts">
import "./style/index.scss"

import Sidebar from "./components/navigation/Sidebar.vue"
import Header from "./components/navigation/Header.vue"
import { onBeforeMount } from "vue";
import { get } from "./bin/fetch";

onBeforeMount(async () => {
  // get('/account/login')
  //   .then(() => {
  //     console.log('ok');
      
  //   })
  //   .catch(() => {
  //     console.log('not ok');
  //   })

  // get()
})
</script>

<template>
  <div class="quote-app">
    <Header v-if="$route.name !== 'Login'" />

    <div class="quote-content-wrap">
      <router-view v-slot="{ Component }">
        <transition name="tab" mode="out-in">
          <component :is="Component"></component>
        </transition>
      </router-view>
    </div>
  </div>
</template>
