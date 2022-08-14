<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { onClickOutside } from "@vueuse/core"
import { Blocks } from "../types/quote-types"

type Button =
  | {
      value: any
      label: string
      icon?: string
    }
  | string

interface Props {
  buttons: Button[]
}

interface Emits {
  (e: "set", value: string): void
}

const emit = defineEmits<Emits>()
defineProps<Props>()

// Wrapper stuff
const open = ref(false)
const wrapper = ref()

onClickOutside(wrapper, () => {
  setTimeout(() => {
    open.value = false
  }, 10)
})

// Emitting
function setValue(btn: Button) {
  open.value = false
  emit("set", typeof btn === "string" ? btn : btn.value)
}
</script>

<template>
  <div ref="wrapper" class="dropdown-wrapper-el">
    <!-- This slot is for the activation button -->

    <div @click="open = !open">
      <slot />
    </div>
    <div class="dropdown-element is-active" v-if="open">
      <button v-for="btn in buttons" @click="setValue(btn)">
        <template v-if="typeof btn !== 'string' && btn.icon">
          <Icon :code="btn.icon" />
        </template>

        {{ typeof btn === "string" ? btn : btn.label }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dropdown-wrapper-el {
  position: relative;

  .dropdown-element.is-active {
    left: 50%;
    top: 75%;
  }
}
</style>
