<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { ContextQuoteContent } from "../../../../types/quote-types"

interface Props {
  data: ContextQuoteContent
}

const props = defineProps<Props>()
</script>

<template>
  <div class="quote-item-content-block quote-item-context">
    <strong>{{ props.data.text }}</strong>

    <div class="quote-item-quotee">
      <Icon size="1.6" code="e244" />
      <a :href="props.data.quotee">{{ props.data.quotee }}</a>
    </div>
  </div>
</template>
