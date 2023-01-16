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
    <!-- <div class="quote-profile-bg">
      <div class="bg-wrap">
        <svg :style="{ transform: `translateY(${-(y / 3)}px)` }" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" width="1440" height="560" preserveAspectRatio="none" viewBox="0 0 1440 560">
          <g mask="url(&quot;#SvgjsMask1012&quot;)" fill="none">
            <rect width="1440" height="560" x="0" y="0" :fill="normal" />
            <path d="M0,629.936C118.344,642.65,238.185,589.152,329.767,513.128C416.342,441.26,451.26,329.371,489.535,223.563C525.012,125.488,558.256,25.101,543.659,-78.166C529.042,-181.573,471.632,-270.72,407.966,-353.505C341.007,-440.572,268.947,-527.714,166.827,-568.159C59.82,-610.539,-72.455,-642.084,-171.144,-582.862C-270.391,-523.305,-253.115,-371.603,-319.141,-276.537C-374.828,-196.357,-499.243,-169.809,-523.665,-75.292C-548.268,19.927,-483.427,112.658,-442.851,202.243C-402.151,292.102,-358.128,378.319,-287.171,446.847C-203.824,527.341,-115.208,617.559,0,629.936" :fill="dark" />
            <path d="M1440 979.683C1519.027 995.798 1601.821 960.875 1667.998 914.7719999999999 1732.888 869.566 1769.275 797.289 1803.884 726.1800000000001 1839.281 653.452 1887.616 577.177 1870.813 498.058 1854.181 419.746 1768.202 381.502 1717.519 319.529 1664.876 255.16000000000003 1641.632 163.88 1567.196 126.81200000000001 1488.733 87.73899999999998 1392.988 88.947 1309.771 116.47899999999998 1227.845 143.58499999999998 1157.877 203.04000000000002 1113.359 276.964 1072.333 345.09000000000003 1091.268 429.723 1074.341 507.426 1055.661 593.178 964.44 681.197 1008.806 756.92 1054.723 835.289 1184.1399999999999 790.869 1264.837 832.559 1333.982 868.281 1363.742 964.1320000000001 1440 979.683" :fill="light" />
          </g>
        </svg>
      </div>
    </div> -->

    <div class="quote-container">
      <!-- <div class="quote-user-highlight">
        <p>My plan worked, we didnt get APH!</p>
        <span class="tag gray">Quote #62</span>
      </div> -->

      <div class="quote-user-info">
        <div class="image-wrap">
          <img src="https://i.imgur.com/4K5rYum.png" alt="">
        </div>

        <div>
          <h2>dolanske</h2>
          <p>Can't we use the usernames and just make sure people use the same usernames when they sign up to idbin so that they automatically get their quotes assigned.</p>
        </div>

        <div class="profile-bg">
          <!-- <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="transparent" :stroke="normal" d="M45.4,-53.9C49.7,-41.1,37.8,-20.6,38.9,1.1C40,22.8,54.2,45.5,49.9,51.2C45.5,56.8,22.8,45.3,7.4,37.9C-7.9,30.5,-15.9,27.2,-26,21.5C-36,15.9,-48.2,7.9,-47.6,0.6C-47,-6.7,-33.5,-13.3,-23.4,-26.2C-13.3,-39,-6.7,-57.9,6.9,-64.8C20.6,-71.8,41.1,-66.7,45.4,-53.9Z" transform="translate(100 100)" />
          </svg> -->

          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="transparent" stroke="#f9be27" stroke-width="0.2" d="M25.1,-38.7C35.1,-32.6,47.6,-30,48.7,-23.4C49.9,-16.9,39.8,-6.3,35.4,3.1C31,12.6,32.3,20.8,31.7,35.1C31.2,49.3,28.8,69.5,21.1,71.6C13.4,73.8,0.5,58,-12.2,50.3C-25,42.6,-37.6,43.1,-51.7,38.4C-65.7,33.7,-81.1,23.8,-84.8,11C-88.4,-1.7,-80.3,-17.3,-69.1,-27.3C-57.9,-37.2,-43.6,-41.4,-31.6,-46.5C-19.5,-51.6,-9.8,-57.6,-1.1,-55.9C7.6,-54.1,15.1,-44.7,25.1,-38.7Z" transform="translate(100 100)" />
          </svg>
        </div>

        <!-- <pre>
          {{ user.settings }}
        </pre> -->
      </div>
    </div>
  </div>
</template>
