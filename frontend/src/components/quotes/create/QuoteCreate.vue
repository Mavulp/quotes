<script setup lang="ts">
import { computed, onBeforeMount, reactive, ref } from 'vue'
import { required, useFormValidation, withMessage } from '../../../bin/validation'
import { useCreate } from '../../../store/create'
import { writableComputed } from '../../../bin/composables'

import InputText from '../../form/InputText.vue'
import InputCheckbox from '../../form/InputCheckbox.vue'
import InputSelect from '../../form/InputSelect.vue'
import Dropdown from '../../Dropdown.vue'

import { useToast } from '../../../store/toast'

import { useLoading } from '../../../store/loading'
import { get } from '../../../bin/fetch'
import type { Tag } from '../../../types/quote-types'
import FragmentText from './fragments/FragmentText.vue'
import FragmentImage from './fragments/FragmentImage.vue'

const create = useCreate()
const loading = useLoading()
const toast = useToast()

/**
 * Form editable fields
 */

const tags = writableComputed(create, 'form.tags')
const offensive = computed({
  get: () => create.form.offensive,
  set: (value) => {
    create.form.offensive = value
  },
})

const options = [
  { value: 'yes', label: 'Yes, it does' },
  { value: 'no', label: 'No, it does not' },
]

const rules = computed(() => ({
  offensive: {
    required: withMessage(
      'It is required to specify wether the quote contains offensive content or not.',
      required,
    ),
  },
}))
const { validate, errors } = useFormValidation(reactive({ offensive }), rules, {
  autoclear: true,
})

async function submit() {
  validate()
    .then(() => {
      create.submitQuote()
    })
    .catch(() => {
      toast.push({ type: 'error', message: 'Error creating Quote. Check for errors in the form.' })
    })
}

/**
 * Block Creation
 */
const blocks = computed(() => create.form.fragments)

// Select a block
const dropdownOptions = [
  { value: 'text', label: 'Context', icon: 'e23f' },
  { value: 'text-highlight', label: 'Highlight', icon: 'e244' },
  { value: 'image', label: 'Image', icon: 'e3f4' },
  { value: 'image-highlight', label: 'Image Highlight', icon: 'e40b' },
]

// Tags

const tagOptions = ref()

onBeforeMount(async () => {
  tagOptions.value = await get<Tag[]>('/tag')
    .then((res) => {
      return res.map(tag => ({
        value: tag.name,
        label: tag.name,
      }))
    })
})

// const tagOptions =
</script>

<template>
  <div class="quote-create" :class="{ 'is-loading': loading.get('create') }">
    <div class="quote-blocks">
      <template v-for="(fragment, index) in blocks" :key="index + fragment.type">
        <FragmentText
          v-if="fragment.type === 'text'"
          :class="{ 'block-create-highlight': fragment.highlight }"
          :data="fragment"
          :index="index"
        />
        <FragmentImage
          v-else-if="fragment.type === 'image'"
          :class="{ 'is-highlight': fragment.highlight }"
          :data="fragment"
          :index="index"
        />
      </template>
    </div>

    <div class="add-block" :class="{ 'has-blocks': blocks.length > 0 }">
      <button
        v-for="button in dropdownOptions"
        :key="button.value"
        class="button"
        @click="create.addFragment(button.value)"
      >
        <Icon :code="button.icon" />
        {{ button.label }}
      </button>
    </div>

    <div class="quote-publish">
      <div class="tag-wrap">
        <InputSelect
          v-model:selected="tags"
          icon="e867"
          :options="tagOptions"
          placeholder="Choose tags fitting the quote (optional)"
          :multiple="true"
        />

        <router-link class="button btn-gray btn-round" :to="{ name: 'RouteTags' }" data-title-top="Add New Tags">
          <Icon code="e145" size="1.8" />
        </router-link>
      </div>

      <InputSelect
        v-model:selected="offensive"
        icon="e031"
        :options="options"
        placeholder="Does this quote contain offensive content? *"
        :error="errors.offensive"
      />

      <button class="button wide" @click="submit">
        <Spinner v-if="loading.get('create')" class="white" />
        <template v-else>
          Post
        </template>
      </button>
    </div>
  </div>
</template>
