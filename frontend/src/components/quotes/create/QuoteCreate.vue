<script setup lang="ts">
import { computed, reactive } from 'vue'
import { required, useFormValidation, withMessage } from '../../../bin/validation'
import { useCreate } from '../../../store/create'
import { writableComputed } from '../../../bin/composables'

import InputText from '../../form/InputText.vue'
import InputCheckbox from '../../form/InputCheckbox.vue'
import InputSelect from '../../form/InputSelect.vue'
import Dropdown from '../../Dropdown.vue'

import { useToast } from '../../../store/toast'

import FragmentText from './fragments/FragmentText.vue'
import FragmentImage from './fragments/FragmentImage.vue'

const create = useCreate()
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
</script>

<template>
  <div class="quote-create">
    <div class="quote-blocks">
      <template v-for="([id, fragment], index) in blocks" :key="id">
        <FragmentText
          v-if="fragment.type === 'text'"
          :id="id"
          :class="{ 'block-create-highlight': fragment.highlight }"
          :data="fragment"
          :index="index"
        />
        <FragmentImage
          v-else-if="fragment.type === 'image'"
          :id="id"
          :class="{ 'is-highlight': fragment.highlight }"
          :data="fragment"
          :index="index"
        />
      </template>
    </div>

    <div class="add-block" :class="{ 'has-blocks': blocks.size > 0 }">
      <span class="add-block-label">Choose a block</span>
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
      <InputText
        v-model:value="tags"
        icon="e867"
        placeholder="Tags (comma separated)"
      />

      <InputSelect
        v-model:selected="offensive"
        icon="e031"
        :options="options"
        placeholder="Does this quote contain offensive content? *"
        :error="errors.offensive"
      />

      <button class="button" @click="submit">
        Post
      </button>
    </div>
  </div>
</template>
