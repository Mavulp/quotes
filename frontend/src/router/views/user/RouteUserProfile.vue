<script setup lang='ts'>
import { onBeforeMount } from 'vue'
import { useUser } from '../../../store/user'

const user = useUser()
</script>

<template>
  <div class="quote-profile">
    <div class="quote-profile-bg" />

    <div class="quote-container">
      <pre>
        {{ user.settings }}
      </pre>
    </div>
  </div>
</template>
