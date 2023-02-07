<script setup lang='ts'>
import { computed, onBeforeMount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClipboard } from '@vueuse/core'
import dayjs from 'dayjs'
import Countdown from '@chenfengyuan/vue-countdown'
import type { Quote, Tag } from '../../../types/quote-types'
import type { Comment } from '../../../types/comment-types'
import { useQuote } from '../../../store/quote'
import { $fetch, del, get, post, put } from '../../../bin/fetch'
import { useToast } from '../../../store/toast'
import { useLoading } from '../../../store/loading'
import { date, padTo2Digits } from '../../../bin/utils'

import ModelFragmentHighlight from '../../../components/quotes/quote-item/fragments/ModelFragmentHighlight.vue'
import ModelFragmentText from '../../../components/quotes/quote-item/fragments/ModelFragmentText.vue'
import ModelFragmentImage from '../../../components/quotes/quote-item/fragments/ModelFragmentImage.vue'
import CommentItem from '../../../components/comments/CommentItem.vue'
import CommentCreate from '../../../components/comments/CommentCreate.vue'
import UserLink from '../../../components/user/UserLink.vue'
import { useFilters } from '../../../store/filters'
import { useUser } from '../../../store/user'
import { getRndColor } from '../../../bin/color'
import { useCreate } from '../../../store/create'
import InputSelect from '../../../components/form/InputSelect.vue'

const route = useRoute()
const router = useRouter()
const quotes = useQuote()
const loading = useLoading()
const filters = useFilters()
const user = useUser()
const create = useCreate()

const { copy } = useClipboard()

const quote = ref<Quote>()
const comments = ref<Comment[]>([])
const quoteTags = ref<string[]>()

watch(() => route.params.id, (id) => {
  if (!id)
    return

  quotes.fetchQuote(Number(id))
    .then((res) => {
      quote.value = res
      quoteTags.value = res.tags
    })

  loading.add('comments')
  get(`/quote/${id}/comment`)
    .then(res => comments.value = res)
    .finally(() => loading.del('comments'))
}, { immediate: true })

function goBack() {
  if (!quote.value)
    return

  router.go(-1)
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
  if (!id)
    return

  loading.add(`del-comment-${id}`)
  await del(`/comment/${id}`)

  comments.value = comments.value.filter(c => c.id !== id)
  loading.del(`del-comment-${id}`)
}

// Get random quote
function random() {
  const id = quotes.getRandomQuoteId()
  router.push({ name: 'RouteQuoteDetail', params: { id } })
}

function filterOnTag(tag: string) {
  filters.setFilter('tag', [tag])
  router.push({ name: 'RouteQuoteList' })
}

// Highlight stuff

const isHighlighted = computed(() => Number(route.params.id) === user.settings.highlightedQuoteId)

function saveHighlight() {
  user.updateSettings({
    ...user.settings,
    highlightedQuoteId: Number(route.params.id),
  })
}

function removeHighlight() {
  user.updateSettings({
    ...user.settings,
    highlightedQuoteId: null,
  })
}

function hasPfp(u: string) {
  return user.users.find(us => us.username === u)?.profilePicture ?? undefined
}

// Edit stuff
function openEdit() {
  if (!quote.value)
    return

  create.prefillForm(quote.value)
  router.push({
    name: 'RouteQuoteAdd',
  })
}
const showEdit = ref(true)

// Update quote tags
const tagOptions = ref()

onBeforeMount(async () => {
  tagOptions.value = await $fetch('tags', get<Tag[]>('/tag'))
    .then((res) => {
      return res.map(tag => ({
        value: tag.name,
        label: tag.name,
      }))
    })
})

const select = ref()

function triggerClick() {
  if (select.value)
    select.value.open = true
}

watch(quoteTags, async (value) => {
  if (!quote.value)
    return

  await put(`/quote/${quote.value.id}`, { tags: value })
})
</script>

<template>
  <div class="quote-detail">
    <Transition name="tab" mode="out-in">
      <Spinner v-if="loading.get('quote-detail')" class="mg" />

      <div v-else-if="quote" class="quote-container">
        <div class="quote-detail-top">
          <button class="button btn-round btn-white" data-title-bottom="Go Back" @click="goBack">
            <Icon code="e5c4" size="1.8" />
          </button>

          <span>Added by: <UserLink :user="quote.author" /> </span>

          <div class="dot-padder" />

          <div class="quotees-circles">
            <router-link
              v-for="item in quote.indices"
              :key="item.quotee"
              :to="{ name: 'RouteUserProfile', params: { username: item.quotee } }"
              :data-title-top="item.quotee"
            >
              <template v-if="hasPfp(item.quotee)">
                <img :src="hasPfp(item.quotee)" alt="">
              </template>
              <div v-else :style="{ backgroundColor: getRndColor() }">
                {{ item.quotee.at(0) }}
              </div>
            </router-link>
          </div>

          <div class="dot-padder" />

          <span class="date">{{ date.simple(quote.createdAt) }}</span>

          <div class="flex-1" />
          <template v-if="showEdit && quote.createdAt - Date.now() < 0 && quote.author === user.username">
            <Countdown
              :key="quote.id"
              v-slot="{ minutes, seconds }"
              data-title-top="This quote is editable"
              :time="dayjs.utc(quote.createdAt * 1000).add(15, 'minute').diff(Date.now())"
              @end="showEdit = false"
            >
              {{ padTo2Digits(minutes) }}:{{ padTo2Digits(seconds) }}
            </Countdown>

            <button v-if="showEdit" class="button red highlight btn-white btn-round" data-title-top="Edit" @click="openEdit">
              <Icon code="e3c9" size="2" />
            </button>
          </template>

          <!-- Is highlighted -->
          <button v-if="isHighlighted" class="button highlight btn-white btn-round" data-title-top="Remove highlight" @click="removeHighlight">
            <Icon code="e866" size="2" />
          </button>

          <!-- Add highlight -->
          <button v-else class="button highlight btn-white btn-round" data-title-top="Highlight on profile" @click="saveHighlight">
            <Icon code="e867" size="2" />
          </button>

          <button class="button btn-white" @click="random">
            Random
          </button>

          <button class="button btn-white" @click="copyUrl">
            <Icon code="e80d" size="1.8" />
            Share
          </button>
        </div>

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

        <div class="quote-item-tags">
          <div v-for="tag in quoteTags" :key="tag" class="tags">
            <button @click="filterOnTag(tag)">
              {{ tag }}
            </button>
            <div class="dot-padder" />
          </div>

          <div v-if="user.isRole(['moderator', 'edit-quote-metadata'])" class="quote-detail-add-tag">
            <button class="button btn-white" @click="triggerClick">
              <Icon code="f05b" size="1.8" />
              Edit
            </button>

            <InputSelect ref="select" v-model:selected="quoteTags" :multiple="true" :options="tagOptions" placeholder="Add tag" />
          </div>
        </div>

        <div class="quote-comments">
          <span class="comments-title">Comments ({{ comments?.length }})</span>

          <Spinner v-if="loading.get('comments')" />
          <template v-else-if="comments.length > 0">
            <CommentItem v-for="comment in comments" :key="comment.id + comment.text" :data="comment" @delete="delComment" />
          </template>

          <CommentCreate :key="comments.length" @post="postComment" />
        </div>
      </div>
    </Transition>
  </div>
</template>
