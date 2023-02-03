import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  BarElement,
  CategoryScale,
  Chart,
  Colors,
  // Legend,
  LineElement,
  LinearScale,
  PointElement,
  // TimeScale,
  Title,
  Tooltip,
} from 'chart.js'
import utc from 'dayjs/plugin/utc'
import dayjs from 'dayjs'

import App from './App.vue'
import router from './router'

// Global Components
import Icon from './components/global/Icon.vue'
import Spinner from './components/global/Spinner.vue'

// Plugin registration
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Colors, PointElement, LineElement)
dayjs.extend(utc)

const app = createApp(App)

// Plugins and setup
app.use(createPinia())
app.use(router)

// Register global components
app.component('Icon', Icon)
app.component('Spinner', Spinner)

// Final mount
app.mount('#app')
