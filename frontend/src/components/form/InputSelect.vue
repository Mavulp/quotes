<script setup lang="ts">
import { onClickOutside } from "@vueuse/core"
import { computed, ref, watch, toRefs } from "vue"

type Option = {
  label: string
  value: any
}

// REVIEW: possible syntax like this?
// const _options = {
//   kilmanio: "Kilmanoi",
//   "dolanske_!": "JANSKEPANSKE",
//   "zeals-prince 420": "ANDRUSHKLA"
// }

interface Props {
  icon?: string
  placeholder?: string
  multiple?: boolean
  options?: Array<Option | string> | null | undefined
  selected: Array<string> | string | null | undefined
  cantclear?: boolean
  required?: boolean
}

const props = defineProps<Props>()
const open = ref(false)
const self = ref(null)
const search = ref("")

onClickOutside(self, () => {
  open.value = false
})

watch(open, (val) => {
  if (!val) {
    search.value = ""
  }
})

const emit = defineEmits<{
  (e: "update:selected", value: any): void
}>()

const formattedOptions = computed(() => {
  if (!props.options || props.options.length === 0) return null

  return props.options
    .map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          label: item,
          value: item
        }
      } else {
        return item
      }
    })
    .filter((option) =>
      option.label.toString().toLowerCase().includes(search.value.toLowerCase())
    )
})

const selectedLabels = computed(() => {
  if (!props.selected || props.selected.length === 0 || !formattedOptions.value)
    return null

  if (typeof props.selected === "string") {
    const item = formattedOptions.value.find((item) => item.value === props.selected)
    if (item) return item.label
  } else {
    return props.selected
      .map((select: string | Option) => {
        const item = formattedOptions.value?.find((item) => item.value === select)
        if (item) return item.label
        return select
      })
      .join(", ")
  }
})

function setValue(item: Option) {
  // Multiple
  if (props.multiple && Array.isArray(props.selected)) {
    if (props.selected.find((sel) => sel === item.value)) {
      // Clearing
      if (props.cantclear && props.selected.length === 1) return

      const filtered = props.selected.filter((sel) => sel !== item.value)
      emit("update:selected", filtered)
    } else {
      // Setting
      emit("update:selected", [...props.selected, item.value])
    }
  } else {
    // Single

    if (props.selected && props.selected === item.value) {
      //Clearing
      if (props.cantclear) return

      emit("update:selected", null)
    } else {
      // Setting
      emit("update:selected", item.value)

      // Only close if you multiple=false and you just set an item
      open.value = false
    }
  }
}
</script>

<template>
  <div
    class="form-select"
    ref="self"
    :class="{ 'is-open': open, required: required, 'has-icon': icon }"
  >
    <label v-if="icon">
      <Icon :code="icon" />
    </label>

    <button
      class="select-button"
      @click="open = !open"
      :class="{ 'has-selected': selected && selected.length > 0 }"
    >
      <input
        size="1"
        type="text"
        :placeholder="
          selected && selected.length > 0 ? `${selectedLabels}` : `${placeholder}`
        "
        v-model="search"
      />
    </button>

    <div class="dropdown-icon">
      <Icon :code="open ? 'e5c7' : 'e5c5'" />
    </div>

    <div class="select-dropdown">
      <template v-if="formattedOptions && formattedOptions.length > 0">
        <button
          v-for="item in formattedOptions"
          :key="item.label"
          :class="{ 'is-selected': selected && selected.includes(item.value) }"
          @click="setValue(item)"
        >
          <div v-html="item.label" />

          <template v-if="!cantclear">
            <span
              class="remove-item material-icons"
              v-if="selected && selected.includes(item.value)"
            >
              &#xe5cd;
            </span>
            <span class="add-item material-icons" v-else>&#xe145;</span>
          </template>
        </button>
      </template>
      <span class="select-no-options" v-else>Nothing to select.</span>
    </div>
  </div>
</template>
