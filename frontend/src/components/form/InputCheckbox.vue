<script setup lang="ts">
import { computed } from "vue"

interface Props {
  label?: string
  check: boolean
  iconOn?: string
  iconOff?: string
}

const emit = defineEmits<{
  (e: "update:check", value: boolean): void
}>()

const props = withDefaults(defineProps<Props>(), {
  iconOn: "&#xe834;",
  iconOff: "&#xe835;"
})

const data = computed<boolean>({
  get() {
    return props.check
  },
  set(value) {
    emit("update:check", value)
  }
})

const d = computed(() => "id" + Math.random().toString(16).slice(2))
</script>

<template>
  <div class="form-checkbox">
    <input type="checkbox" :name="d" :id="d" v-model="data" />
    <label :for="d">
      <div class="icon">
        <span v-if="check" class="material-icons" v-html="props.iconOn"></span>
        <span v-else class="material-icons" v-html="props.iconOff"></span>
      </div>

      <p v-if="props.label">{{ props.label }}</p>
    </label>
  </div>
</template>
