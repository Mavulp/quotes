<script setup lang='ts'>
import { isEmpty } from 'lodash'
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '../../store/user'

const user = useUser()
const route = useRoute()
const router = useRouter()

onBeforeMount(() => {
  // const query = route.query as { token: string }

  // if (isEmpty(query)) {
  //   user.redirectToSignIn()
  // }
  // else {
  //   localStorage.setItem('quotes_bearer_token', query.token)
  //   router.push({ name: 'RouteHome' })
  // }
})
</script>

<template>
  <div>
    auth
  </div>
</template>
