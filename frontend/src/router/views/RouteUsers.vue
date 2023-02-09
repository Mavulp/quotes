<script setup lang='ts'>
import { computed } from 'vue'
import { useUser } from '../../store/user'
import { arrayIntoChunks } from '../../bin/utils'
import UserPageItem from '../../components/user/UserPageItem.vue'

const user = useUser()
const columns = computed(() => arrayIntoChunks(user.users, 3))
</script>

<template>
  <div class="quote-container container-header">
    <div class="quote-users">
      <div v-for="(col, index) in columns" :key="index" clas="col">
        <UserPageItem v-for="item in col" :key="item.username" :user="item" />
      </div>
    </div>
  </div>
</template>
