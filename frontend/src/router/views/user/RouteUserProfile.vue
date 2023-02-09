<script setup lang='ts'>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { useUser } from '../../../store/user'
import { useQuote } from '../../../store/quote'
import { useLoading } from '../../../store/loading'
import { useFilters } from '../../../store/filters'
import { sanitize } from '../../../bin/comments'

import UserProfileQuote from '../../../components/user/UserQuote.vue'
import ModalSettings from '../../../components/modal/ModalSettings.vue'
import Modal from '../../../components/Modal.vue'

const user = useUser()
const filters = useFilters()
const quotes = useQuote()
const loading = useLoading()
const route = useRoute()
const router = useRouter()

const profile = computed(() => user.users.find(u => u.username === route.params.username))
const highlightQuote = computed(() => quotes.getQuoteById(profile.value?.highlightedQuoteId))
const quotedQuotes = computed(() => quotes.getQuotedQuotes(String(route.params.username)).slice(0, 3))

// Name
const editing = ref(false)

// Redirect back to filters
function quotesByUser() {
  if (!profile.value)
    return

  // Go to quote list and filter to quotes where person is the author
  filters.setFilter('author', [profile.value.username])
  router.push({ name: 'RouteQuoteList' })
}

function quotesFromUser() {
  if (!profile.value)
    return

  // Go to quote list and filter to quotes where person is a quotee
  filters.setFilter('quotee', [profile.value.username])
  router.push({ name: 'RouteQuoteList' })
}
</script>

<template>
  <div class="quote-profile">
    <img class="bg" src="/bg/blobs.svg" alt="">

    <div class="quote-container">
      <div v-if="loading.get('users')">
        <Spinner />
      </div>

      <template v-else-if="profile">
        <div class="quote-side">
          <div class="quote-side-content">
            <div class="image-wrap">
              <img :src="profile.profilePicture ?? '/user-alt.svg'">
            </div>

            <ul>
              <li :data-title-top="`Quotes posted by ${profile.username}`">
                <button @click="quotesByUser">
                  Posted <span>{{ quotes.getAuthoredQuotes(profile.username).length }}</span>
                </button>
              </li>
              <li><div class="dot-padder" /></li>
              <li :data-title-top="`Quotes from ${profile.username}`">
                <button @click="quotesFromUser">
                  Quoted <span>{{ quotes.getQuotedQuotes(profile.username).length }}</span>
                </button>
              </li>
            </ul>

            <button v-if="profile.username === user.user.username" class="edit-btn" data-title-top="Edit Profile" @click="editing = true">
              <Icon code="e8b8" size="2" />
            </button>
          </div>
        </div>

        <div class="quote-user-info">
          <Modal v-if="editing" @close="editing = false">
            <ModalSettings />
          </Modal>

          <div>
            <h1>{{ profile.username }}</h1>

            <div class="flex-wrap left">
              <button :data-title-top="`Quotes posted by ${profile.username}`" class="button semiwide btn-gray" @click="quotesByUser">
                Posted
              </button>

              <button :data-title-top="`Quotes from ${profile.username}`" class="button semiwide" @click="quotesFromUser">
                Quoted
              </button>
            </div>

            <div v-if="profile.bio" class="profile-markdown-wrap" v-html="sanitize(marked.parse(profile.bio))" />

            <hr>

            <template v-if="highlightQuote">
              <strong class="section-title highlight">Highlighted Quote</strong>

              <UserProfileQuote class="highlight-quote" :data="highlightQuote" />
              <hr>
            </template>

            <strong class="section-title">Latest quotes</strong>

            <template v-if="quotedQuotes && quotedQuotes.length > 0">
              <UserProfileQuote v-for="quote in quotedQuotes" :key="quote.id" :data="quote" />
            </template>
          </div>
        </div>
      </template>
      <div v-else>
        <h1>This user does not exist.</h1>
        <br>
        <button class="button" @click="router.go(-1)">
          Return
        </button>
      </div>
    </div>
  </div>
</template>
