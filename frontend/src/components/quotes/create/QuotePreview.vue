<script setup lang="ts">
import { computed } from 'vue'
import { useCreate } from '../../../store/create'
import { useUser } from '../../../store/user'
import type { Quote, Quotee } from '../../../types/quote-types'

import QuoteListItem from '../quote-item/QuoteListItem.vue'

const create = useCreate()
const user = useUser()

const formatted = computed<Quote>(() => {
  const form = create.form
  const fragments = form.fragments

  return {
    id: 1111,
    author: user.user.username,
    indices: fragments
      .filter(block => block.quotee)
      .map(
        (block, index): Quotee => ({
          quotee: block.quotee,
          index: index + 1,
        }),
      )
      .filter(item => item.quotee),
    offensive: form.offensive === 'yes',
    createdAt: Date.now() / 1000,
    // ...(form.location && { location: form.location }),
    fragments,
    tags: [],
  }
})
</script>

<template>
  <div class="quote-preview">
    <p v-if="create.form.fragments.length === 0" class="quote-preview-empty">
      There's nothing to preview. Add at least one block.
    </p>

    <QuoteListItem v-else class="quote-disabled" :data="formatted" />
  </div>
</template>
