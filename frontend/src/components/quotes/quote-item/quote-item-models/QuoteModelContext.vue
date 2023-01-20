<script setup lang="ts">
import type { ContextFragment } from '../../../../types/quote-types'

interface Props {
  data: ContextFragment
}

const props = defineProps<Props>()
</script>

<template>
  <div class="quote-item-content-block quote-item-context">
    <strong>{{ props.data.content }}</strong>

    <div v-if="props.data.quotee" class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <span v-if="props.data.quotee === 'Anonymous'">Anonymous</span>
      <a v-else :href="props.data.quotee">{{ props.data.quotee }}</a>
    </div>
  </div>
</template>
