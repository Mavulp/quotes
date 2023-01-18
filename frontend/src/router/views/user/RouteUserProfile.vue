<script setup lang='ts'>
import { computed } from 'vue'
import { useUser } from '../../../store/user'
import { getRanMinMax } from '../../../bin/utils'

const user = useUser()

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

const { light, normal, dark } = colorOfTheDay()
// const { y } = useWindowScroll()

// Name
// const name = computed(() => user.settings.displayName ?? )
</script>

<template>
  <div class="quote-profile">
    <div class="quote-container">
      <div class="quote-side">
        <svg width="1000" height="1100" viewBox="0 0 1000 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#filter0_f_408_13)">
            <path d="M534.771 367.406C541.154 402.542 525.515 441.511 545.303 468.981C565.411 496.452 620.945 512.103 619.988 519.769C618.711 527.435 560.1100 527.116 539.239 564.808C517.536 602.819 531.579 678.841 522.962 685.549C514.344 691.937 482.428 629.011 462.959 592.278C443.809 555.225 436.787 544.684 409.977 537.657C382.848 530.63 336.25 527.435 304.014 503.798C272.098 480.161 254.225 435.762 256.14 387.529C258.374 339.297 279.758 287.231 319.015 266.788C357.953 246.345 414.126 257.525 456.894 278.926C499.343 300.647 528.387 332.269 534.771 367.406Z" fill="#2762F9" fill-opacity="0.5" />
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
            <img src="https://i.imgur.com/4K5rYum.png" alt="">
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
        <button class="edit-btn" data-title-top="Edit Profile">
          <Icon code="e8b8" />
        </button>

        <div>
          <h2>dolanske</h2>
          <p>Can't we use the usernames and just make sure people use the same usernames when they sign up to idbin so that they automatically get their quotes assigned.</p>

          <hr>

          <router-link :to="{ name: 'RouteQuoteDetail', params: { id: 1 } }" class="quote-user-highlight">
            <p>My plan worked, we didnt get APH!</p>
            <div class="flex-wrap">
              <span class="tag highlight">Highlighted</span>
              <span class="tag gray">Quote #62</span>
            </div>
          </router-link>

          <router-link :to="{ name: 'RouteQuoteDetail', params: { id: 2 } }" class="quote-user-normal">
            <p>My plan worked, we didnt get APH!</p>
            <span class="tag gray">Quote #23</span>
          </router-link>

          <router-link :to="{ name: 'RouteQuoteDetail', params: { id: 2 } }" class="quote-user-normal">
            <p>I never said that!</p>
            <span class="tag gray">Quote #15</span>
          </router-link>

          <div class="flex-wrap" style="padding-left:20px">
            <button class="button">
              View All
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
