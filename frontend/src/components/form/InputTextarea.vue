<script setup lang="ts">
import { Error } from "../../bin/validation"

interface Props {
  // label?: string
  icon?: string
  value: string | undefined
  type?: string
  error?: Error
  required?: boolean
}

const {
  // label,
  value,
  type = "text",
  error,
  required = false,
  icon = null
} = defineProps<Props>()
const emit = defineEmits<{
  (e: "update:value", value: string): void
}>()

function updateValue(e: any) {
  emit("update:value", e.target.value)
}
</script>

<template>
  <div
    class="form-textarea"
    :class="{ 'input-error': error && error.invalid, required: required }"
  >
    <label v-if="icon">
      <Icon :code="icon" />
    </label>
    <textarea
      v-bind="$attrs"
      tabindex="0"
      class="border-smoke font-14"
      :type="type"
      @input="updateValue"
      @keydown="(e) => e.stopPropagation()"
      :value="value"
    />
    <div class="input-error-list" v-if="error && error.invalid">
      <p v-for="item in error.errors">{{ item }}</p>
    </div>
  </div>
</template>
