<script setup lang="ts">
import type { Error } from '../../bin/validation'

interface Props {
  icon?: string
  value?: string | number | null
  type?: string
  error?: Error
  required?: boolean
  canClear?: boolean
}

const {
  // label,
  value,
  type = 'text',
  error,
  required = false,
  icon = null,
  canClear = false,
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
    class="form-input"
    :class="{
      'input-error': error && error.invalid,
      'required': required,
      'has-icon': icon,
    }"
  >
    <label v-if="icon">
      <Icon :code="icon" />
    </label>
    <input v-bind="$attrs" tabindex="0" :type="type" :value="value" size="1" @input="updateValue">
    <button v-if="value && canClear" @click="emit('update:value', '')">
      <span class="material-icons">&#xe5cd;</span>
    </button>
    <div v-if="error && error.invalid" class="input-error-list">
      <p v-for="item in error.errors" :key="item">
        {{ item }}
      </p>
    </div>
  </div>
</template>
