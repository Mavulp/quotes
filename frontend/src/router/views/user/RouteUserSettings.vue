<script setup lang='ts'>
import { onBeforeMount } from 'vue'
import { useUser } from '../../../store/user'

const user = useUser()

onBeforeMount(() => {
})
</script>

<template>
  <div>
    <pre>
      {{ user.settings }}
    </pre>
  </div>
</template>
