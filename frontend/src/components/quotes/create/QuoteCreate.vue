<script setup lang="ts">
import { reactive, computed } from "vue"
import { useCreate } from "../../../store/create"
import { writableComputed } from "../../../bin/composables"
import { required, useFormValidation } from "../../../bin/validation"
import { toBool } from "../../../bin/utils"
import {
  Blocks,
  ContextQuoteContent,
  HighlightQuoteContent,
  ImageQuoteContent
} from "../../../types/quote-types"

import InputText from "../../form/InputText.vue"
import InputCheckbox from "../../form/InputCheckbox.vue"
import InputSelect from "../../form/InputSelect.vue"
import Dropdown from "../../Dropdown.vue"

import BlockContext from "./blocks/BlockContext.vue"
import BlockHighlight from "./blocks/BlockHighlight.vue"
import BlockImage from "./blocks/BlockImage.vue"

const create = useCreate()

/**
 * Form editable fields
 */

const location = writableComputed(create, "form.location")
const comments = writableComputed(create, "form.comments")
const anonymous = writableComputed(create, "form.anonymous")
const anonymousQuotees = writableComputed(create, "form.anonymousQuotees")
const offensive = computed({
  get: () => String(create.form.offensive),
  set: (value) => {
    create.form.offensive = toBool(value)
  }
})

const options = [
  { value: "true", label: "Yes, it does" },
  { value: "false", label: "No, it does not" }
]

const rules = computed(() => ({ offensive: { required } }))
const { validate, errors } = useFormValidation(reactive({ offensive }), rules, {
  autoclear: true
})

async function submit() {
  validate()
    .then(() => {
      console.log("form ok")
    })
    .catch((e) => {
      console.log(e)
    })
}

/**
 * Block Creation
 */
const blocks = computed(() => create.form.blocks)

// Select a block
const dropdownOptions = [
  { value: "context", label: "Context", icon: "e23f" },
  { value: "highlight", label: "Highlight", icon: "e244" },
  { value: "image", label: "Image", icon: "e3f4" }
]

function append(type: string) {
  create.appendBlock(type as Blocks)
}
</script>

<template>
  <div class="quote-create">
    <div class="quote-blocks">
      <template v-for="[index, block] in blocks">
        <BlockContext v-if="block.type === 'context'" :data="block" :index="index" />
        <BlockHighlight v-else-if="block.type === 'highlight'" :data="block" :index="index" />
        <BlockImage v-else-if="block.type === 'image'" :data="block" :index="index" />
      </template>
    </div>

    <Dropdown @set="append" :buttons="dropdownOptions">
      <button class="add-block" :class="{ 'has-blocks': blocks.size > 0 }">
        <span>
          <Icon code="e146" />
          {{ blocks.size > 0 ? "Add another block" : "Add a block" }}
        </span>
      </button>
    </Dropdown>

    <div class="quote-publish">
      <InputText
        icon="e0c8"
        v-model:value="location"
        placeholder="Location (IRL, TeamSpeak, IRC ...)"
      />
      <InputCheckbox label="Enable comment section" v-model:check="comments" />
      <InputCheckbox label="Hide author username (you)" v-model:check="anonymous" />
      <InputCheckbox label="Hide quotee username" v-model:check="anonymousQuotees" />

      <InputSelect
        icon="e031"
        :options="options"
        v-model:selected="offensive"
        placeholder="Does this quote contain offensive content? *"
        :error="errors.offensive"
      />

      <button class="button" @click="submit">Post</button>
    </div>
  </div>
</template>
