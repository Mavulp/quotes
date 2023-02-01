<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { useUser } from '../../../store/user'
import { getRanMinMax } from '../../../bin/utils'
import { useQuote } from '../../../store/quote'
import { useLoading } from '../../../store/loading'
import { useFilters } from '../../../store/filters'

import UserProfileQuote from '../../../components/user/UserQuote.vue'
import ModalSettings from '../../../components/modal/ModalSettings.vue'
import Modal from '../../../components/Modal.vue'
import { sanitize } from '../../../bin/comments'

const user = useUser()
const filters = useFilters()
const quotes = useQuote()
const loading = useLoading()
const route = useRoute()
const router = useRouter()

const profile = computed(() => user.users.find(u => u.username === route.params.username))
const highlightQuote = computed(() => quotes.getQuoteById(profile.value?.highlightedQuoteId))
const quotedQuotes = computed(() => quotes.getQuotedQuotes(String(route.params.username)).slice(0, 3))

function colorOfTheDay() {
  const date = new Date()
  // Gives back the number of the day in the year
  const day = (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000
  // Get a random brightness
  const tint = getRanMinMax(50, 85)

  return {
    light: `hsla(${day}, ${tint}%, ${60}%)`,
    normal: `hsla(${day}, ${tint}%, ${50}%)`,
    dark: `hsla(${day}, ${tint}%, ${40}%)`,
  }
}

const { normal } = colorOfTheDay()

// Name
const editing = ref(false)

// watch(editing, (val) => {
//   if (!val)
//     user.fetchUsers()
// })

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
    <div class="quote-container">
      <div v-if="loading.get('users')">
        <Spinner />
      </div>

      <template v-else-if="profile">
        <div class="quote-side">
          <svg width="1000" height="1100" viewBox="0 0 1000 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_f_408_13)">
              <path d="M534.771 367.406C541.154 402.542 525.515 441.511 545.303 468.981C565.411 496.452 620.945 512.103 619.988 519.769C618.711 527.435 560.1100 527.116 539.239 564.808C517.536 602.819 531.579 678.841 522.962 685.549C514.344 691.937 482.428 629.011 462.959 592.278C443.809 555.225 436.787 544.684 409.977 537.657C382.848 530.63 336.25 527.435 304.014 503.798C272.098 480.161 254.225 435.762 256.14 387.529C258.374 339.297 279.758 287.231 319.015 266.788C357.953 246.345 414.126 257.525 456.894 278.926C499.343 300.647 528.387 332.269 534.771 367.406Z" :fill="normal" fill-opacity="0.5" />
            </g>
            <defs>
              <filter id="filter0_f_408_13" x="0" y="0" width="876" height="942" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="128" result="effect1_foregroundBlur_408_13" />
              </filter>
            </defs>
          </svg>

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
            <div v-if="profile.bio" class="profile-markdown-wrap" v-html="sanitize(marked.parse(profile.bio))" />

            <hr>

            <template v-if="highlightQuote">
              <strong class="profile-title highlight">Highlighted Quote</strong>

              <UserProfileQuote class="highlight-quote" :data="highlightQuote" />
              <hr>
            </template>

            <strong class="profile-title">Latest quotes</strong>

            <template v-if="quotedQuotes && quotedQuotes.length > 0">
              <UserProfileQuote v-for="quote in quotedQuotes" :key="quote.id" :data="quote" />
            </template>

            <div class="flex-wrap center">
              <button :data-title-top="`Quotes posted by ${profile.username}`" class="button semiwide btn-gray" @click="quotesByUser">
                All Posts
              </button>

              <button :data-title-top="`Quotes from ${profile.username}`" class="button semiwide" @click="quotesFromUser">
                Quoted
              </button>
            </div>
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
