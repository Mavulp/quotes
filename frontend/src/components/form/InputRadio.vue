<script setup lang="ts">
import { computed } from "vue"

export interface RadioProps {
  label?: string
  icon?: string
  value: any
  check: any
  group: string
}

const props = defineProps<RadioProps>()
const emit = defineEmits<{
  (e: "update:check", value: any): void
}>()

const value = computed({
  get() {
    return props.check
  },
  set(value) {
    emit("update:check", value)
  }
})

const id = Math.random().toString()
</script>

<template>
  <div class="form-radio">
    <input type="radio" :id="id" :value="props.value" :name="group" v-model="value" />
    <label :for="id"><Icon :code="props.icon" />{{ props.label }}</label>
  </div>
</template>
