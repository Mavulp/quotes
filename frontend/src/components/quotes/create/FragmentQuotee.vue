<script setup lang='ts'>
import { ref } from 'vue'
import InputText from '../../form/InputText.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div>
    <InputText :value="modelValue" class="form-quotee" placeholder="Add a quotee (optional)" @update:value="(v) => emit('update:modelValue', v)" />
  </div>
</template>
