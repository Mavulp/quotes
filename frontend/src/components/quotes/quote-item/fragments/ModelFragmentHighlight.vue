<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { TextFragment } from '../../../../types/quote-types'
import { clamp } from '../../../../bin/utils'

interface Props {
  data: TextFragment
}

const props = defineProps<Props>()
const route = useRoute()
</script>

<template>
  <div class="quote-item-content-block quote-item-highlight">
    <strong>{{ props.data.content }}</strong>

    <div class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <router-link v-if="route.name === 'RouteQuoteDetail'" :to="{ name: 'RouteUserProfile', params: { username: props.data.quotee } }">
        {{ props.data.quotee }}
      </router-link>
      <p v-else>
        {{ props.data.quotee }}
      </p>
    </div>
  </div>
</template>
