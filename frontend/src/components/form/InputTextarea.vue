<script setup lang="ts">
import type { Error } from '../../bin/validation'

interface Props {
  // label?: string
  icon?: string
  value?: string | undefined
  type?: string
  error?: Error
  required?: boolean
}

const {
  // label,
  value,
  type = 'text',
  error,
  required = false,
  icon = null,
} = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

function updateValue(e: any) {
  emit('update:value', e.target.value)
}
</script>

<template>
  <div
    class="form-textarea"
    :class="{ 'input-error': error && error.invalid, 'required': required, 'has-icon': icon }"
  >
    <label v-if="icon">
      <Icon :code="icon" />
    </label>
    <textarea
      v-bind="$attrs"
      tabindex="0"
      class="border-smoke font-14"
      :type="type"
      :value="value"
      @input="updateValue"
      @keydown="(e) => e.stopPropagation()"
    />
    <div v-if="error && error.invalid" class="input-error-list">
      <p v-for="item in error.errors" :key="item">
        {{ item }}
      </p>
    </div>
  </div>
</template>
