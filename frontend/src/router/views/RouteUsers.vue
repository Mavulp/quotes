<script setup lang='ts'>
import { useUser } from '../../store/user'

const user = useUser()
</script>

<template>
  <div>
    <pre>
      {{ user.users }}
    </pre>
  </div>
</template>
