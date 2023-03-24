<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useUser } from '../../store/user'

const users = useUser()

onBeforeMount(() => {
  users.fetchUsers()
})
</script>

<template>
  <div class="route-game">
    <!-- <div class="quote-container"> -->
    <RouterView />
    <!-- </div> -->
  </div>
</template>
