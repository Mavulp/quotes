<script setup lang='ts'>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '../../../store/user'
import { getRanMinMax } from '../../../bin/utils'
import ModalSettings from '../../../components/modal/ModalSettings.vue'
import type { Quote } from '../../../types/quote-types'
import { useQuote } from '../../../store/quote'
import { useLoading } from '../../../store/loading'
import type { User } from '../../../types/user-types'

const user = useUser()
const quote = ref<Quote>()
const quotes = useQuote()
const loading = useLoading()
const route = useRoute()
const router = useRouter()

const profile = ref<User>()

// onBeforeMount(query)
watch(() => route.params, async (value) => {
  if (!value.username)
    return

  const username = value.username.toString()
  profile.value = await user.fetchUser(username)

  // Fetch highlighted quote
  const quoteId = profile.value?.highlightedQuoteId
  if (quoteId)
    quote.value = await quotes.fetchQuote(quoteId)
}, { deep: true, immediate: true })

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
</script>

<template>
  <div class="quote-profile">
    <div class="quote-container">
      <div v-if="loading.get('user')">
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
              <li data-title-top="View quotes added by this user">
                <a href="">Added <span>15</span></a>
              </li>
              <li><div class="circle" /></li>
              <li data-title-top="View quotes by this user">
                <a href="">Quoted <span>16</span></a>
              </li>
            </ul>
          </div>
        </div>

        <div class="quote-user-info">
          <button v-if="profile.username === user.user.username" class="edit-btn" data-title-top="Edit Profile" @click="editing = true">
            <Icon code="e8b8" />
          </button>

          <Teleport v-if="editing" to="body">
            <ModalSettings @close="editing = false" />
          </Teleport>

          <div>
            <h2>{{ user.getUsername(profile.username) }}</h2>
            <p>{{ profile.bio }}</p>

            <!--  -->

            <hr>

            <router-link :to="{ name: 'RouteQuoteDetail', params: { id: 1 } }" class="quote-user-highlight">
              <p>My plan worked, we didnt get APH!</p>
              <div class="flex-wrap">
                <span class="tag highlight">Highlighted</span>
                <span class="tag gray">Quote #62</span>
              </div>
            </router-link>

            <!-- <router-link :to="{ name: 'RouteQuoteDetail', params: { id: 2 } }" class="quote-user-normal">
            <p>My plan worked, we didnt get APH!</p>
            <span class="tag gray">Quote #23</span>
          </router-link>

          <router-link :to="{ name: 'RouteQuoteDetail', params: { id: 2 } }" class="quote-user-normal">
            <p>I never said that!</p>
            <span class="tag gray">Quote #15</span>
          </router-link> -->

            <div class="flex-wrap" style="padding-left:20px">
              <button class="button">
                View All
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
