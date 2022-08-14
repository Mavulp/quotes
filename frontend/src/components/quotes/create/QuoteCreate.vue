<script setup lang="ts">
import { ref, reactive, computed, onBeforeMount } from "vue"
import { useCreate } from "../../../store/create"
import { writableComputed } from "../../../bin/composables"
import { required, useFormValidation } from "../../../bin/validation"
import { toBool } from "../../../bin/utils"

import InputText from "../../form/InputText.vue"
import InputCheckbox from "../../form/InputCheckbox.vue"
import InputSelect from "../../form/InputSelect.vue"

const create = useCreate()

onBeforeMount(() => {
  create.reset()
})

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
</script>

<template>
  <div class="quote-create">
    <div class="quote-blocks"></div>

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
