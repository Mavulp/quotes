<script setup lang="ts">
//

import { onBeforeMount } from 'vue'
import { useUser } from '../../store/user'

const user = useUser()

onBeforeMount(() => {
  user.fetchUser()
})
</script>

<template>
  <div class="quote-home">
    <!-- <div class="quote-container"> -->
    <!-- </div> -->
  </div>
</template>
