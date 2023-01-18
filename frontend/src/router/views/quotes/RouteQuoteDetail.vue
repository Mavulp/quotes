<script setup lang='ts'>
import { onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Quote } from '../../../types/quote-types'
import { useQuote } from '../../../store/quote'

const route = useRoute()
const router = useRouter()
const quotes = useQuote()
const quote = ref<Quote>()

onBeforeMount(async () => {
  const id = route.params.id

  if (!id)
    return router.go(-1)

  quote.value = await quotes.fetchQuote(Number(id))
})
</script>

<template>
  <div>
    <pre>
      {{ quote }}
    </pre>
  </div>
</template>
