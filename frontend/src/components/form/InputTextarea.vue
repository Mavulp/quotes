<script setup lang="ts">
import type { Error } from '../../bin/validation'

interface Props {
  // label?: string
  icon?: string
  modelValue?: string | undefined
  type?: string
  error?: Error
  required?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function updateValue(e: any) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div
    class="form-textarea"
    :class="{ 'input-error': props.error && props.error.invalid, 'has-icon': props.icon }"
  >
    <label v-if="props.icon">
      <Icon :code="props.icon" />
    </label>
    <textarea
      v-bind="$attrs"
      tabindex="0"
      class="border-smoke font-14"
      :value="props.modelValue"
      @input="updateValue"
    />
    <template v-if="props.error?.invalid">
      <p v-for="item in props.error.errors" :key="item" class="error-item">
        {{ item }}
      </p>
    </template>
  </div>
</template>
