<script setup lang="ts">
import type { TextFragment } from '../../../../types/quote-types'

interface Props {
  data: TextFragment
}

const props = defineProps<Props>()
</script>

<template>
  <div class="quote-item-content-block quote-item-context">
    <strong>{{ props.data.content }}</strong>

    <div v-if="props.data.quotee" class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <router-link :to="{ name: 'RouteUserProfile', params: { username: props.data.quotee } }">
        {{ props.data.quotee }}
      </router-link>
    </div>
  </div>
</template>
