<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { isNil } from 'lodash'
import { computed, ref, toRefs, watch } from 'vue'
import type { Error } from '../../bin/validation'

interface Option {
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
  error?: Error
}

const props = withDefaults(defineProps<Props>(), {
  cantclear: true,
})
const emit = defineEmits<{
  (e: 'update:selected', value: any): void
}>()
const open = ref(false)
const self = ref(null)
const search = ref('')

onClickOutside(self, () => {
  open.value = false
})

watch(open, (val) => {
  if (!val)
    search.value = ''
})

const formattedOptions = computed(() => {
  if (!props.options || props.options.length === 0)
    return null

  return props.options
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return {
          label: item,
          value: item,
        }
      }
      else {
        return item
      }
    })
    .filter(option => option.label.toString().toLowerCase().includes(search.value.toLowerCase()))
})

const selectedLabels = computed(() => {
  if (!props.selected || props.selected.length === 0 || !formattedOptions.value)
    return null

  if (typeof props.selected === 'string') {
    const item = formattedOptions.value.find(item => item.value === props.selected)
    if (item)
      return item.label
  }
  else {
    return props.selected
      .map((select: string | Option) => {
        const item = formattedOptions.value?.find(item => item.value === select)
        if (item)
          return item.label
        return select
      })
      .join(', ')
  }

  return ''
})

function setValue(item: Option) {
  // Multiple
  if (props.multiple && Array.isArray(props.selected)) {
    if (props.selected.find(sel => sel === item.value)) {
      // Clearing
      if (props.cantclear && props.selected.length === 1)
        return

      const filtered = props.selected.filter(sel => sel !== item.value)
      emit('update:selected', filtered)
    }
    else {
      // Setting
      emit('update:selected', [...props.selected, item.value])
    }
  }
  else {
    // Single

    if (props.selected && props.selected === item.value) {
      // Clearing
      if (props.cantclear)
        return

      emit('update:selected', null)
    }
    else {
      // Setting
      emit('update:selected', item.value)

      // Only close if you multiple=false and you just set an item
      open.value = false
    }
  }
}

defineExpose({
  open,
})
</script>

<template>
  <div
    ref="self"
    class="form-select"
    :class="{
      'is-open': open,
      'required': required,
      'has-icon': icon,
      'has-error': props.error?.invalid,
    }"
  >
    <label v-if="icon">
      <Icon :code="icon" />
    </label>

    <button
      class="select-button"
      :class="{ 'has-selected': selected && selected.length > 0 && selected !== 'null' }"
      @click="open = !open"
    >
      <input
        v-model="search"
        size="1"
        type="text"
        :placeholder="
          !isNil(selected)
            ? `${selectedLabels ?? props.placeholder}`
            : `${props.placeholder}`
        "
      >
    </button>

    <div class="dropdown-icon">
      <Icon :code="open ? 'e5c7' : 'e5c5'" />
    </div>

    <div class="select-dropdown dropdown-element">
      <template v-if="formattedOptions && formattedOptions.length > 0">
        <button
          v-for="item in formattedOptions"
          :key="item.label"
          :class="{ 'is-selected': selected && selected.includes(item.value) }"
          @click="setValue(item)"
        >
          <div v-html="item.label" />

          <!-- <template v-if="!props.cantclear">
            <span
              v-if="selected && selected.includes(item.value)"
              class="remove-item material-icons"
            >
              &#xe5cd;
            </span>
            <span v-else-if="props.multiple" class="add-item material-icons">&#xe145;</span>
          </template> -->
        </button>
      </template>
      <span v-else class="select-no-options">Nothing to select.</span>
    </div>
    <template v-if="props.error?.invalid">
      <p v-for="item in props.error.errors" :key="item" class="error-item">
        {{ item }}
      </p>
    </template>
  </div>
</template>
