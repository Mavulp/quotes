<script setup lang="ts">
//

import { computed } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useLocalStorage } from '@vueuse/core'
import { displayDateLong } from '../../bin/time'
import { useUser } from '../../store/user'
import { useQuote } from '../../store/quote'
import Modal from '../../components/Modal.vue'

const quote = useQuote()
const router = useRouter()
const user = useUser()

// const profile = computed(() => user.user)

function random() {
  const id = quote.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}

// Prompt to understand funny
const open = useLocalStorage('quotes_funny_prompt', true)
</script>

<template>
  <div class="quote-home">
    <Modal v-if="open" :close="false" @close="open = false">
      <div class="quote-container-small">
        <div class="modal-content modal-conditions">
          <h1>Content Agreement</h1>

          <p>I understand that humor is subjective and out of context statements made do not necessarily reflect the views of those involved.</p>
          <p>I also acknowledge that what is funny yesterday may not be tomorrow. I will bring some salt.</p>

          <button style="margin:0 auto" class="button btn-large" @click="open = false">
            Acknowledge
          </button>
        </div>
      </div>
    </Modal>

    <Transition name="fade" appear>
      <img src="/bg/blobs.svg" class="bg" alt="">
    </Transition>

    <div class="quote-container">
      <div>
        <h1>Hivecom Quotes</h1>
        <p>Said something very funny, unfunny, or didn't say it in that way at all? It'll probably end up posted here anyway.</p>
        <br>
        <div class="flex-wrap start">
          <router-link class="button btn-large btn-highlight" :to="{ name: 'RouteQuoteAdd' }">
            <Icon code="e745" />
            Add Quote
          </router-link>
          <button class="button btn-large btn-gray" @click="random">
            Random Quote
          </button>
        </div>
      </div>
      <router-link :to="{ name: 'RouteQuoteList' }" class="quote-example">
        <div class="example-header">
          <span>
            Fish
            <b>#27</b>
          </span>
          <div class="dot-padder" />
          <span>reported by <b>Apple</b></span>
          <div class="flex-1" />
          <span>{{ dayjs.utc().format(displayDateLong) }}</span>
        </div>

        <div class="example-content">
          <div class="example-line">
            <strong>What was the bowling ball doing at the funeral?</strong>
            <span><Icon size="1.6" code="e244" />Crabe</span>
          </div>
          <div class="example-line">
            <strong><img src="https://friends.hivecom.net/emotes/emotesv2_a2a5c3db772f4d949a9fe8c5eb193891.gif" alt=""></strong>
            <span><Icon size="1.6" code="e244" />Fish</span>
          </div>
          <div class="example-line highlight">
            <strong>It was bawling. HEHE!!</strong>
            <span><Icon size="1.6" code="e244" />Crabe</span>
          </div>
        </div>
      </router-link>
    </div>

    <p class="made-by">
      <Icon size="2" code="e86f" />
      Made by <a href="https://github.com/mavulp" target="_blank">Mavulp</a> in 2023
    </p>
  </div>
</template>
