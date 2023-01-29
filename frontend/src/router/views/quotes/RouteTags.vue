<script setup lang='ts'>
import { profile } from 'console'
import { computed, onMounted, ref, watch } from 'vue'
import { get } from '../../../bin/fetch'
import Search from '../../../components/form/Search.vue'
import ModalTag from '../../../components/modal/ModalTag.vue'
import TagItem from '../../../components/tags/TagItem.vue'
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
const prefill = ref<Tag | null>(null)

watch(open, (val) => {
  if (!val)
    query(true)
})

function editTag(id: number) {
  const fill = tags.value.find(tag => tag.id === id)

  if (!fill)
    return

  prefill.value = fill
  open.value = true
}
</script>

<template>
  <div class="route-tags">
    <section id="header" class="quote-page-header">
      <div class="quote-container">
        <div class="quote-title-wrap text">
          <h1>Tags</h1>

          <button class="button semiwide btn-gray" @click="open = true">
            <Icon code="e145" size="1.8" />
            Create
          </button>

          <Teleport v-if="open" to="body">
            <ModalTag :prefill="prefill" @close="open = false" />
          </Teleport>
        </div>

        <div class="quote-title-wrap">
          <Search v-model:value="search" style="width:324px" placeholder="Search for tags" />
        </div>
        <!-- <p>Quotes are used to contextually assign theme or topic to a quote. You can assign multiple tags to a single quote.</p> -->
      </div>
    </section>

    <div class="quote-container">
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
