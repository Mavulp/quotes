<script setup lang='ts'>
import { onClickOutside, useMagicKeys, whenever } from '@vueuse/core'
import { ref } from 'vue'
import { isValidImage } from '../../bin/comments'
import Search from '../form/Search.vue'

import aliases from './test.json'

const emit = defineEmits<{
  (e: 'insert', name: string): void
}>()
const self = ref()
const search = ref('')
const open = ref(false)

onClickOutside(self, () => open.value = false)

const keys = useMagicKeys()
whenever(keys.Escape, () => open.value = false)
</script>

<template>
  <div ref="self" class="comment-alias-picker" :class="{ open }">
    <button data-title-bottom="Add an Emote" class="button btn-gray btn-round picker" @click="open = !open">
      <Icon code="ea22" size="1.8" />
    </button>

    <Transition name="fade" mode="out-in">
      <div v-show="open" class="alias-list">
        <Search v-model:value="search" placeholder="Search for an emote" />

        <div class="alias-items">
          <template v-for="alias in aliases" :key="alias.name">
            <template v-if="alias.name && alias.content">
              <button v-show="search.length === 0 || alias.name.includes(search)" class="alias-item" @click="emit('insert', alias.name)">
                <div class="alias-content">
                  <div v-if="isValidImage(alias.content)" class="alias-image">
                    <img :src="alias.content" alt="" load="lazy" lazyload="true">
                  </div>
                  <p v-else>
                    {{ alias.content }}
                  </p>
                </div>

                <span class="alias-name">!{{ alias.name }}</span>
              </button>
            </template>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>
