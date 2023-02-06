<script setup lang='ts'>
import { onClickOutside } from '@vueuse/core'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useUser } from '../../../store/user'
import InputText from '../../form/InputText.vue'
import Modal from '../../Modal.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const users = useUser()

// Input
const search = ref('')
const isFocused = ref(false)

// Modal stuff
const open = ref(false)
const newUser = ref<string>()

function openModal() {
  open.value = true
  search.value = ''
}

// Options
const options = computed(() => users.users.map(u => u.username))

// Filter options based on search input
const autoComplete = computed(() => {
  if (!search.value)
    return options.value

  return options.value.filter(option => option.toLowerCase().includes(search.value.toLowerCase()))
})

async function setQuotee(user: string) {
  emit('update:modelValue', user)

  await nextTick()

  search.value = ''
  open.value = false
  newUser.value = undefined
  isFocused.value = false
}

// Click outside reset
const target = ref()
onMounted(() => {
  onClickOutside(target, () => {
    isFocused.value = false
  })
})
</script>

<template>
  <div ref="target" class="quote-add-quotee">
    <div class="form-input form-quotee" :class="{ 'placeholder-visible': props.modelValue.length > 0 }">
      <input
        v-model="search"
        type="text"
        :placeholder="props.modelValue.length > 0 ? props.modelValue : 'Add a quotee'"
        @focus="isFocused = true"
      >

      <button v-if="search || props.modelValue" tabindex="-1" @click="setQuotee('')">
        <span class="material-icons">&#xe5cd;</span>
      </button>
    </div>

    <div v-if="isFocused || search" class="dropdown-element is-active" tabindex="-1">
      <template v-if="autoComplete.length > 0">
        <button
          v-for="user in autoComplete"
          :key="user"
          tabindex="0"
          @click="setQuotee(user)"
          v-html="user.replaceAll(search, `<b>${search}</b>`)"
        />
      </template>
      <button v-else class="btn-add" @click="openModal">
        <Icon code="e7fe" size="1.8" />
        Add New User
      </button>
    </div>
  </div>

  <Modal v-if="open" @close="setQuotee('')">
    <div class="quote-container-small">
      <div class="modal-content">
        <h2>Add New User</h2>
        <p>To prevent data pullution and incorrect statistics, it is required to not create funny or misspelled names of already existing users.</p>
        <br>
        <br>

        <InputText v-model:value="newUser" placeholder="New username" />
        <br>
        <div class="flex-wrap center">
          <button class="button wide" :disabled="!newUser || newUser.length === 0" @click="setQuotee(newUser ?? '')">
            Create
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>
