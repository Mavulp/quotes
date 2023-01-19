<script setup lang="ts">
import { computed, reactive } from 'vue'
import { required, useFormValidation, withMessage } from '../../../bin/validation'
import { useCreate } from '../../../store/create'
import { writableComputed } from '../../../bin/composables'
import { toBool } from '../../../bin/utils'
import type { Fragments } from '../../../types/quote-types'

import InputText from '../../form/InputText.vue'
import InputCheckbox from '../../form/InputCheckbox.vue'
import InputSelect from '../../form/InputSelect.vue'
import Dropdown from '../../Dropdown.vue'

import BlockContext from './blocks/BlockContext.vue'
import BlockHighlight from './blocks/BlockHighlight.vue'
import BlockImage from './blocks/BlockImage.vue'

const create = useCreate()

/**
 * Form editable fields
 */

const location = writableComputed(create, 'form.location')
const comments = writableComputed(create, 'form.comments')
const anonymous = writableComputed(create, 'form.anonymous')
const anonymousQuotees = writableComputed(create, 'form.anonymousQuotees')
const offensive = computed({
  get: () => String(create.form.offensive),
  set: (value) => {
    create.form.offensive = toBool(value)
  },
})

const options = [
  { value: 'true', label: 'Yes, it does' },
  { value: 'false', label: 'No, it does not' },
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
      // console.log('form ok')
    })
    .catch((e) => {
      // console.log(e)
    })
}

/**
 * Block Creation
 */
const blocks = computed(() => create.form.fragments)

// Select a block
const dropdownOptions = [
  { value: 'context', label: 'Context', icon: 'e23f' },
  { value: 'highlight', label: 'Highlight', icon: 'e244' },
  { value: 'image', label: 'Image', icon: 'e3f4' },
]

function append(type: string) {
  create.appendBlock(type as Fragments)
}
</script>

<template>
  <div class="quote-create">
    <div class="quote-blocks">
      <template v-for="([id, block], index) in blocks" :key="id">
        <BlockContext v-if="block.type === 'context'" :id="id" :data="block" :index="index" />
        <BlockHighlight
          v-else-if="block.type === 'highlight'"
          :id="id"
          :data="block"
          :index="index"
        />
        <BlockImage v-else-if="block.type === 'image'" :id="id" :data="block" :index="index" />
      </template>
    </div>

    <Dropdown :buttons="dropdownOptions" @set="append">
      <button class="add-block" :class="{ 'has-blocks': blocks.size > 0 }">
        <span>
          <Icon code="e146" />
          {{ blocks.size > 0 ? "Add another block" : "Add a block" }}
        </span>
      </button>
    </Dropdown>

    <div class="quote-publish">
      <InputText
        v-model:value="location"
        icon="e0c8"
        placeholder="Location (IRL, TeamSpeak, IRC ...)"
      />

      <InputSelect
        v-model:selected="offensive"
        icon="e031"
        :options="options"
        placeholder="Does this quote contain offensive content? *"
        :error="errors.offensive"
      />

      <InputCheckbox v-model:check="comments" label="Enable comment section" />
      <InputCheckbox v-model:check="anonymous" label="Hide author username (you)" />
      <InputCheckbox v-model:check="anonymousQuotees" label="Hide quotee username" />

      <button class="button" @click="submit">
        Post
      </button>
    </div>
  </div>
</template>
