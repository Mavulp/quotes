<script setup lang='ts'>
import { computed, onBeforeMount, onBeforeUnmount, reactive, ref } from 'vue'
import { post, put } from '../../bin/fetch'
import { maxLength, minLength, required, useFormValidation } from '../../bin/validation'
import { useLoading } from '../../store/loading'
import { useToast } from '../../store/toast'
import type { Tag } from '../../types/quote-types'

import InputText from '../form/InputText.vue'
import InputTextarea from '../form/InputTextarea.vue'
import Modal from '../Modal.vue'

const props = defineProps<{
  prefill?: Tag
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const loading = useLoading()
const toast = useToast()

const form = reactive<Omit<Tag, 'id' | 'author' | 'createdAt'>>({
  name: '',
  description: '',
})

const rules = computed(() => ({
  name: {
    minLenght: minLength(1),
    maxLenght: maxLength(96),
    required,
  },
  description: {
    // minLenght: minLength(3),
    maxLenght: maxLength(2048),
  },
}))

onBeforeMount(() => {
  if (props.prefill)
    Object.assign(form, props.prefill)
})

onBeforeUnmount(() => {
  Object.assign(form, { name: '', description: '' })
})

const { validate, errors } = useFormValidation(form, rules, { autoclear: true })

function submit() {
  validate()
    .then(async () => {
      loading.add('tag-create')

      if (props.prefill) {
        // #1 Editing a tag
        put(`/tag/${props.prefill.id}`, form)
          .then(() => {
            toast.push({
              type: 'success',
              message: 'Succesfully updated a new tag.',
            })

            emit('close')
          })
          .catch(() => {
            toast.push({
              type: 'error',
              message: 'Error when updating a new tag.',
            })
          })
      }
      else {
        // #2 Adding a tag
        await post('/tag', form)
          .then(() => {
            toast.push({
              type: 'success',
              message: 'Succesfully added a new tag.',
            })

            emit('close')
          })
          .catch(() => {
            toast.push({
              type: 'error',
              message: 'Error when adding a new tag.',
            })
          })
      }

      loading.del('tag-create')
    })
    .catch(() => {
      toast.push({
        type: 'error',
        message: 'Error during tag creation. Please check the form for errors.',
      })
    })
}
</script>

<template>
  <Modal @close="emit('close')">
    <div class="quote-container-small">
      <div class="modal-content ">
        <h2>{{ props.prefill ? 'Edit' : "Create" }} a Tag</h2>
        <p>Tags are used to contextually group quotes and usually describe the quote in one way or another. You can also add multiple tags to a single quote.</p>
        <br>
        <br>
        <strong>Name</strong>
        <InputText v-model:value="form.name" placeholder="Tag name" :error="errors.name" />
        <strong>Description (optional)</strong>
        <InputTextarea v-model="form.description" placeholder="Description" class="has-round" :error="errors.description" />

        <br>
        <div class="flex-wrap right">
          <button class="button semiwide" @click="submit">
            <Spinner v-if="loading.get('tag-create')" />
            <template v-else>
              Save
            </template>
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>
