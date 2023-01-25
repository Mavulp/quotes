<script setup lang="ts">
import { computed } from 'vue'
import type { TextFragment } from '../../../../types/quote-types'
import { clamp } from '../../../../bin/utils'

interface Props {
  data: TextFragment
}

const props = defineProps<Props>()
</script>

<template>
  <div class="quote-item-content-block quote-item-highlight">
    <strong>{{ props.data.content }}</strong>

    <div class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <a :href="props.data.quotee">{{ props.data.quotee }}</a>
    </div>
  </div>
</template>
