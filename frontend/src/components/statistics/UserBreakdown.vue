<script setup lang='ts'>
import { computed, ref } from 'vue'
import { useQuote } from '../../store/quote'
import { useUser } from '../../store/user'
import { date, getKey, getVal, objectToArray, percent, toNum } from '../../bin/utils'

import InputSelect from '../form/InputSelect.vue'
import StatCell from './StatCell.vue'

const quote = useQuote()
const user = useUser()

// Select active user to base everything on

const activeUser = ref(user.username)

// The base filtered quotes to a single user
// const quotes = computed(() => quote.quotes.filter(q => q.author === user.username || q.indices.some(i => i.quotee === user.username)))

const quoted = computed(() => quote.quotes.filter(q => q.indices.some(i => i.quotee === activeUser.value)))
const authored = computed(() => quote.quotes.filter(q => q.author === activeUser.value))

// Most quoted by
const quotedBy = computed(() => objectToArray(quoted.value.reduce((group, quote) => {
  group[quote.author] ? group[quote.author]++ : group[quote.author] = 1
  return group
}, {} as Record<string, number>)).sort((a, b) => getVal(a) < getVal(b) ? 1 : -1))

// Most posting quotes of
const quoting = computed(() => objectToArray(authored.value.reduce((group, quote) => {
  const users = new Set<string>()
  for (const item of quote.indices)
    users.add(item.quotee)

  for (const user of users)
    group[user] ? group[user]++ : group[user] = 1

  return group
}, {} as Record<string, number>)).sort((a, b) => getVal(a) < getVal(b) ? 1 : -1))
</script>

<template>
  <div class="quote-container">
    the dates are wrong i think

    <InputSelect v-model:selected="activeUser" icon="e7fd" :options="user.users.map(u => u.username)" />
    <div class="stats-grid user">
      <StatCell str label="Quoted" :data="`${toNum(quoted.length)} - ${percent(quoted.length, quote.quotes.length).toFixed(2)}%`" />
      <StatCell str label="Most quoted by" :data="`${getKey(quotedBy[0])} - ${getVal(quotedBy[0])}`" />
      <StatCell str label="First time quoted" :data="date.timeShort(quoted[0].createdAt)" />

      <StatCell str label="Posted" :data="`${toNum(authored.length)} - ${percent(authored.length, quote.quotes.length).toFixed(2)}%`" />
      <StatCell str label="Most quoting" :data="`${getKey(quoting[0])} - ${getVal(quoting[0])}`" />
      <StatCell str label="First time posted" :data="date.timeShort(authored[0].createdAt)" />
    </div>
  </div>
</template>
