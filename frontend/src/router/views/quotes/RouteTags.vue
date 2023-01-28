<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { get } from '../../../bin/fetch'
import TagItem from '../../../components/tags/TagItem.vue'
import { useLoading } from '../../../store/loading'
import type { Tag } from '../../../types/quote-types'

const tags = ref<Tag[]>()
const loading = useLoading()

onMounted(async () => {
  loading.add('tags')
  tags.value = await get('/tag')
  loading.del('tags')
})
</script>

<template>
  <div class="route-tags">
    <div class="quote-container">
      <section id="header" class="quote-list-header">
        <div class="quote-title-wrap text">
          <h1>Tags</h1>

          <button class="button wide">
            Add
          </button>
        </div>

        <div class="quote-title-wrap quote-filters" />
        <!-- <p>Quotes are used to contextually assign theme or topic to a quote. You can assign multiple tags to a single quote.</p> -->
      </section>
    </div>

    <div class="quote-container">
      <Spinner v-if="loading.get('tags')" />
      <template v-else>
        <TagItem v-for="tag in tags" :key="tag.id" :data="tag" />
      </template>
    </div>
  </div>
</template>
