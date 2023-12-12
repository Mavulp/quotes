<script setup lang='ts'>
import { computed, ref } from 'vue'
import { isEmpty } from 'lodash'
import { useQuote } from '../../store/quote'
import { useUser } from '../../store/user'
import { date, getKey, getVal, objectToArray, percent, toNum } from '../../bin/utils'
import type { Ratio } from '../../types/statistics-types'

import InputSelect from '../form/InputSelect.vue'
import StatCell from './StatCell.vue'
import RatioCell from './RatioCell.vue'

const quote = useQuote()
const user = useUser()

// Select active user to base everything on

const activeUser = ref(user.username)
const userOptions = computed(() => user.users.map(u => u.username))

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

// First time quoted, filtering out 1970 dates
const firstQuoted = computed(() => quoted.value.filter(q => q.createdAt !== 0).at(-1))
const firstPosted = computed(() => authored.value.filter(a => a.createdAt !== 0).at(-1))

// Create ratio list

interface Sort { type: 'quoted' | 'posted'; descending: boolean }

const sort = ref<Sort>({
  type: 'quoted',
  descending: true,
})

const ratio = computed(() => {
  // Iterate over all users & prepare empty object
  const users = user.users.reduce((group, user) => {
    group[user.username] = {
      user: user.username,
      quoted: 0,
      posted: 0,
    }

    return group
  }, {} as Record<string, Ratio>)

  for (const q of quote.quotes) {
    if (users[q.author])
      users[q.author].posted++

    const uniqueIndices = new Set(q.indices.map(i => i.quotee))

    for (const indice of uniqueIndices.values()) {
      if (users[indice])
        users[indice].quoted++
    }
  }

  return Object.values(users).sort((a, b) => {
    return a[sort.value.type] > b[sort.value.type]
      ? sort.value.descending ? -1 : 1
      : sort.value.descending ? 1 : -1
  }) as Ratio[]
})
</script>

<template>
  <div class="quote-container quote-smaller">
    <InputSelect v-model:selected="activeUser" icon="e7fd" :options="userOptions" />
    <div class="stats-grid user">
      <StatCell str label="Got quoted" :data="`${toNum(quoted.length)} (${percent(quoted.length, quote.quotes.length).toFixed(2)}%)`" />
      <StatCell str label="Most quoted by" :data="!isEmpty(quotedBy) ? `${getKey(quotedBy[0])} (${getVal(quotedBy[0])})` : '<Nobody>'" />
      <StatCell str label="First time quoted" :data="firstQuoted ? date.timeShort(firstQuoted.createdAt) : '<Never>'" />

      <StatCell str label="Posted quotes" :data="`${toNum(authored.length)} (${percent(authored.length, quote.quotes.length).toFixed(2)}%)`" />
      <StatCell str label="Most quoting" :data="!isEmpty(quoting) ? `${getKey(quoting[0])} (${getVal(quoting[0])})` : '<Nobody>'" />
      <StatCell str label="First time posted" :data="firstPosted ? date.timeShort(firstPosted.createdAt) : '<Never>'" />
    </div>

    <div class="user-list-stats">
      <ul class="user-ratio" :class="{ 'list-quoted': sort.type === 'quoted' }">
        <li>
          <div />
          <div class="header">
            <button class="button btn-white" :class="{ 'is-sorting': sort.type === 'posted' }" @click="sort = { type: 'posted', descending: !sort.descending }">
              Posted
              <Icon :code="sort.descending ? 'e5db' : 'e5d8'" size="1.6" />
            </button>
            <button class="button btn-white" :class="{ 'is-sorting': sort.type === 'quoted' }" @click="sort = { type: 'quoted', descending: !sort.descending }">
              Quoted
              <Icon :code="sort.descending ? 'e5db' : 'e5d8'" size="1.6" />
            </button>
          </div>
        </li>
        <RatioCell
          v-for="value in ratio"
          :key="value.user"
          :class="{ 'is-highlight': value.user === activeUser }"
          :data="value"
        />
      </ul>
      <div />
    </div>
  </div>
</template>
