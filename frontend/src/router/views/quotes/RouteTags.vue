<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { get } from '../../../bin/fetch'
import Search from '../../../components/form/Search.vue'
import TagItem from '../../../components/tags/TagItem.vue'
import { useLoading } from '../../../store/loading'
import type { Tag } from '../../../types/quote-types'

const search = ref('')
const tags = ref<Tag[]>([])
const loading = useLoading()

onMounted(async () => {
  loading.add('tags')
  tags.value = await get('/tag')
  loading.del('tags')
})

const filteredTags = computed(() => {
  return tags.value?.filter(tag => tag.name.includes(search.value))
})
</script>

<template>
  <div class="route-tags">
    <section id="header" class="quote-page-header">
      <div class="quote-container">
        <div class="quote-title-wrap text">
          <h1>Tags</h1>

          <button class="button wide btn-gray">
            Add Tag
          </button>
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
          <TagItem v-for="tag in filteredTags" :key="tag.id" :data="tag" />
        </div>
      </template>
    </div>
  </div>
</template>
