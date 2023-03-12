<script setup lang='ts'>
const props = defineProps<{
  modelValue: boolean
  off?: string
  on?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
// const onlyOneState = computed(() => !props.off || !props.on)
</script>

<template>
  <button
    class="form-switch"
    :class="{
      'is-on': props.modelValue,
    }"
    @click="emit('update:modelValue', !props.modelValue)"
  >
    <span v-if="props.off">{{ props.off }}</span>
    <div class="switch-bg">
      <div class="switch-handle" />
    </div>
    <span v-if="props.on">{{ props.on }}</span>
  </button>
</template>
