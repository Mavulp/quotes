<script setup lang='ts'>
import { onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import type { Quote } from '../../../types/quote-types'
import type { Comment } from '../../../types/comment-types'
import { useQuote } from '../../../store/quote'
import { del, get, post } from '../../../bin/fetch'
import { useToast } from '../../../store/toast'
import { useLoading } from '../../../store/loading'
import { date } from '../../../bin/utils'

import ModelFragmentHighlight from '../../../components/quotes/quote-item/fragments/ModelFragmentHighlight.vue'
import ModelFragmentText from '../../../components/quotes/quote-item/fragments/ModelFragmentText.vue'
import ModelFragmentImage from '../../../components/quotes/quote-item/fragments/ModelFragmentImage.vue'
import CommentItem from '../../../components/comments/CommentItem.vue'
import CommentCreate from '../../../components/comments/CommentCreate.vue'
import UserLink from '../../../components/UserLink.vue'

const route = useRoute()
const router = useRouter()
const quotes = useQuote()
const loading = useLoading()

const { copy } = useClipboard()

const quote = ref<Quote>()
const comments = ref<Comment[]>([])

watch(() => route.params.id, (id) => {
  if (!id)
    return

  quotes.fetchQuote(Number(id))
    .then(res => quote.value = res)

  loading.add('comments')
  get(`/quote/${id}/comment`)
    .then(res => comments.value = res)
    .finally(() => loading.del('comments'))
}, { immediate: true })

function goBack() {
  if (!quote.value)
    return

  router.push({
    name: 'RouteQuoteList',
    hash: `#${quote.value.id}`,
  })
}

const highlightLabel = 'The Funny'

function copyUrl() {
  const toast = useToast()
  copy(window.location.href)
    .then(() => toast.push({ type: 'success', message: 'Copied to clipboard' }))
    .catch(() => toast.push({ type: 'error', message: 'Failed to copy link to clipboard' }))
}

// Post comment and if ok push it to the comment list
async function postComment(text: string) {
  if (!quote.value)
    return

  loading.add('comment')
  const newComment = await post<Comment>(`/quote/${quote.value.id}/comment`, { text })
  loading.del('comment')

  if (!newComment)
    return

  comments.value.push(newComment)
}

// Remove comment
async function delComment(id: number) {
  if (!id || !quote.value)
    return

  await del(`/quote/${quote.value.id}/comment/${id}`)
}

// Get random quote
function random() {
  const id = quotes.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}
</script>

<template>
  <div class="quote-detail">
    <Transition name="fade" mode="out-in">
      <Spinner v-if="loading.get('quote-detail')" class="mg" />

      <div v-else-if="quote" class="quote-container">
        <div class="quote-detail-top">
          <button class="button btn-white" data-title-bottom="Go Back" @click="goBack">
            <Icon code="e5c4" size="1.8" />
          </button>

          <span>Added by:
            <UserLink :user="quote.author" />
          </span>

          <div class="dot-padder" />

          <span class="date">{{ date.time(quote.createdAt) }}</span>

          <div class="flex-1" />

          <button class="button btn-white" @click="random">
            Random
          </button>

          <button class="button btn-white" @click="copyUrl">
            <Icon code="e80d" size="1.8" />
            Share
          </button>
        </div>

        <!-- <div class="quote-detail-header">
          <div class="author">
            <span>Posted by:</span>
            <UserLink :user="quote.author" />
          </div>

          <p>{{ date.time(quote.createdAt) }}</p>
        </div> -->

        <div class="quote-item-content">
          <template v-for="item in quote.fragments" :key="item.index">
            <ModelFragmentText
              v-if="item.type === 'text' && !item.highlight"
              :data="item"
            />
            <ModelFragmentHighlight
              v-if="item.type === 'text' && item.highlight"
              :data-title-right="highlightLabel"
              :data="item"
            />
            <ModelFragmentImage
              v-else-if="item.type === 'image'"
              :data-title-right="item.highlight ? highlightLabel : null"
              :class="{ 'is-highlight': item.highlight }"
              :data="item"
            />
          </template>
        </div>

        <div class="quote-comments">
          <span class="comments-title">Comments ({{ comments?.length }})</span>

          <Spinner v-if="loading.get('comments')" />
          <template v-else-if="comments.length > 0">
            <CommentItem v-for="comment in comments" :key="comment.id" :data="comment" @delete="delComment" />
          </template>

          <CommentCreate :key="comments.length" @post="postComment" />
        </div>
      </div>
    </Transition>
  </div>
</template>
