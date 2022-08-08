<script setup lang="ts">
import "./style/index.scss";

import Sidebar from "./components/navigation/Sidebar.vue";

// import { ref, reactive, computed } from "vue"
</script>

<template>
  <div class="quote-app">
    <Sidebar />

    <div class="quote-content-wrap">
      <router-view></router-view>
    </div>
  </div>
</template>
