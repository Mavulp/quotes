<script setup lang="ts">
import { computed, ref } from "vue"

const username = computed(() => "dolanske")
</script>

<template>
  <div class="quote-sidebar">
    <router-link data-title-right="Add a new quote" :to="{ name: 'QuoteAdd' }" class="sidebar-add">
      <Icon code="e745" />
    </router-link>

    <router-link class="sidebar-link" :to="{ name: 'Home' }">Home</router-link>
    <router-link class="sidebar-link" :to="{ name: 'QuoteList' }">Quotes</router-link>
    <router-link class="sidebar-link" :to="{ name: 'Admin' }">Admin</router-link>

    <div style="flex: 1"></div>

    <router-link
      data-title-right="Your quotes"
      class="sidebar-add sidebar-user"
      :to="{ name: 'UserProfile', params: { username: username } }"
    >
      <Icon code="e7fd" />
    </router-link>
  </div>
</template>
