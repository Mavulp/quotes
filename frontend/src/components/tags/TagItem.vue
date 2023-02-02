<script setup lang='ts'>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { del } from '../../bin/fetch'
import { date } from '../../bin/utils'
import { useFilters } from '../../store/filters'
import { useLoading } from '../../store/loading'
import { useQuote } from '../../store/quote'
import { useToast } from '../../store/toast'
import { useUser } from '../../store/user'
import type { Tag } from '../../types/quote-types'

const props = defineProps<{
  data: Tag
}>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'edit'): void
}>()

const filters = useFilters()
const router = useRouter()
const open = ref(false)
const quote = useQuote()
const loading = useLoading()
const user = useUser()
const toast = useToast()

function filterOnTag() {
  filters.setFilter('tag', [props.data.name])
  router.push({ name: 'RouteQuoteList' })
}

const quotes = computed(() => {
  return quote.quotes
    .filter(q => q.tags.includes(props.data.name))
    .sort((a, b) => b.createdAt - a.createdAt)
})

async function deleteTag() {
  loading.add('tag-delete')
  await del(`/tag/${props.data.id}`)
    .then(() => {
      emit('remove')
      toast.push({
        type: 'success',
        message: 'Succesfully deleted a tag',
      })
    })
  loading.del('tag-delete')
}
</script>

<template>
  <div>
    <div class="tag-item" :class="{ 'is-active': open }">
      <button class="tag-item-header" @click.self="open = !open">
        <span class="title">{{ props.data.name }}</span>
        <div class="flex-1" />
        <span class="quote-amount"> <b>{{ quotes.length }}</b> {{ quotes.length === 1 ? 'quote' : 'quotes' }}</span>
        <button class="button btn-white regular btn-small" data-title-top="Filters quotes by this tag" @click="filterOnTag">
          Discover
          <Icon code="e5c8" size="1.6" />
        </button>
      </button>

      <div v-if="open" class="tag-item-content">
        <!-- <div class="cell">
          <strong>Quotes</strong>
          <span>{{ quotes.length }}</span>
        </div> -->
        <div class="cell">
          <strong>Last Used</strong>
          <span v-if="quotes.length > 0">{{ date.tiny(quotes[0].createdAt) }}</span>
          <span v-else>No Posts.</span>
        </div>

        <div class="cell flex-1">
          <strong>Description</strong>
          <p>
            {{ props.data.description && props.data.description.length > 0 ? props.data.description : 'No description.' }}
          </p>
        </div>

        <div class="cell">
          <strong>Added by</strong>
          <span>{{ props.data.author }}</span>
        </div>

        <div class="cell">
          <strong>Added at</strong>
          <span>{{ date.tiny(props.data.createdAt) }}</span>
        </div>

        <div v-if="user.isRole(['moderator', 'edit-tags', 'delete-tags'])" class="cell flex">
          <button class="button btn-round btn-white" data-title-bottom="Edit" @click="emit('edit')">
            <Icon code="e3c9" size="2" />
          </button>
          <button class="button btn-round btn-white" data-title-bottom="Delete" @click="deleteTag()">
            <Spinner v-if="loading.get('tag-delete')" />
            <Icon v-else code="e872" size="2" />
          </button>
        </div>
      </div>

      <div class="" />
    </div>
  </div>
</template>
