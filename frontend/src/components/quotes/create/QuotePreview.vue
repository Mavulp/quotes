<script setup lang="ts">
import { computed } from 'vue'
import { useCreate } from '../../../store/create'
import type { Quote, Quotee } from '../../../types/quote-types'

import QuoteListItem from '../quote-item/QuoteListItem.vue'

const create = useCreate()

// const formatted = computed<Quote>(() => {
//   const form = create.form
//   const blocks = [...form.fragments.values()]

//   return ''

//   return {
//     id: 1111,
//     author: form.anonymous ? 'Anonymous' : 'You',
//     quotees: form.anonymousQuotees
//       ? [{ username: 'Anonymous', index: 0 }]
//       : blocks
//         .filter(block => block.quotee)
//         .map(
//           (block, index): Quotee => ({
//             username: block.quotee,
//             index: index + 1,
//           }),
//         )
//         .filter(item => item.username),
//     offensive: form.offensive ?? false,
//     createdAt: Date.now(),
//     ...(form.location && { location: form.location }),
//     blocks: blocks.map((block) => {
//       return {
//         ...block,
//         quotee: form.anonymousQuotees ? 'Anonymous' : block.quotee,
//       }
//     }),
//   }
// })
</script>

<template>
  <div class="quote-preview">
    <p v-if="create.form.fragments.size === 0" class="quote-preview-empty">
      There's nothing to preview. Add and fill a quote block first.
    </p>

    <!-- <QuoteListItem v-else :data="formatted" /> -->
  </div>
</template>
