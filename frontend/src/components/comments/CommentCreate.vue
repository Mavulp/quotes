<script setup lang='ts'>
import { computed, reactive } from 'vue'
import { maxLength, minLength, required, useFormValidation, withMessage } from '../../bin/validation'
import { useLoading } from '../../store/loading'

import FormTextarea from '../form/InputTextarea.vue'
import CommentAlias from './CommentAlias.vue'

const emit = defineEmits<{
  (e: 'post', text: string): void
}>()

const loading = useLoading()

const MAX_LEN = 8192

const form = reactive({ text: '' })
const rules = computed(() => ({
  text: {
    maxLength: withMessage('Your comment exceeds the character limit.', maxLength(MAX_LEN)),
    minLength: withMessage('You can not post an empty comment', minLength(1)),
  },
}))

const { validate, errors } = useFormValidation(form, rules, { autoclear: true })

function submit() {
  validate()
    .then(() => emit('post', form.text))
}

function insertAlias(alias: string) {
  let t = `!${alias}`
  if (form.text)
    t = ` ${t}`

  form.text += t
}
</script>

<template>
  <div class="quote-comment-create">
    <form @submit.prevent="submit">
      <FormTextarea v-model="form.text" placeholder="Your comment" />
      <p class="comment-limit">
        {{ form.text.length }} / {{ MAX_LEN }}
      </p>

      <template v-if="errors.text.invalid">
        <p v-for="item in errors.text.errors" :key="item" class="error-item">
          {{ item }}
        </p>
      </template>
    </form>
    <div class="comment-post">
      <!-- <CommentAlias @insert="insertAlias" /> -->

      <button class="button wide" :class="{ 'btn-gray': form.text.length === 0 }" @click="submit">
        <Spinner v-if="loading.get('comment')" class="white" />
        <template v-else>
          Post
        </template>
      </button>
    </div>
  </div>
</template>
