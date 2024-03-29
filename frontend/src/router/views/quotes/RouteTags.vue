<script setup lang='ts'>
import { profile } from 'console'
import { computed, onMounted, ref, watch } from 'vue'
import { get } from '../../../bin/fetch'
import Search from '../../../components/form/Search.vue'
import ModalTag from '../../../components/modal/ModalTag.vue'
import TagItem from '../../../components/tags/TagItem.vue'
import { useCreate } from '../../../store/create'
import { useLoading } from '../../../store/loading'
import type { Tag } from '../../../types/quote-types'

const search = ref('')
const tags = ref<Tag[]>([])
const loading = useLoading()

onMounted(query)

async function query(ignoreLoading = false) {
  if (!ignoreLoading)
    loading.add('tags')

  tags.value = await get('/tag')

  if (!ignoreLoading)
    loading.del('tags')
}

const filteredTags = computed(() => {
  return tags.value?.filter(tag => tag.name.includes(search.value))
})

function removeTag(id: number) {
  tags.value = tags.value.filter(tag => tag.id !== id)
}

// Modal & Tag creation
const open = ref(false)
const prefill = ref<Tag>()

watch(open, (val) => {
  if (!val) {
    prefill.value = undefined
    query(true)
  }
})

function editTag(id: number) {
  const fill = tags.value.find(tag => tag.id === id)

  if (!fill)
    return

  prefill.value = fill
  open.value = true
}

// If current form is not empty, offer a button back
const create = useCreate()
const isFormActive = computed(() => create.form.fragments.length > 0)
</script>

<template>
  <div class="route-tags">
    <section id="header" class="quote-page-header">
      <div class="quote-container quote-smaller">
        <div class="quote-title-wrap text">
          <h1>Tags</h1>

          <router-link v-if="isFormActive" :to="{ name: 'RouteQuoteAdd' }" class="button btn-round btn-white" data-title-bottom="Back To Form">
            <Icon code="e5c4" size="1.8" />
          </router-link>

          <button class="button semiwide btn-gray" @click="open = true">
            <Icon code="e145" size="1.8" />
            Create
          </button>

          <ModalTag v-if="open" :prefill="prefill" @close="open = false" />
        </div>

        <div class="quote-title-wrap">
          <Search v-model:value="search" style="width:324px" placeholder="Search for tags" />
        </div>
        <!-- <p>Quotes are used to contextually assign theme or topic to a quote. You can assign multiple tags to a single quote.</p> -->
      </div>
    </section>

    <div class="quote-container quote-smaller">
      <Spinner v-if="loading.get('tags', 'quote-list')" />
      <template v-else>
        <p class="list-amount">
          {{ filteredTags.length }} tags
        </p>
        <div class="tag-list">
          <TagItem
            v-for="tag in filteredTags"
            :key="tag.id"
            :data="tag"
            @remove="removeTag(tag.id)"
            @edit="editTag(tag.id)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
