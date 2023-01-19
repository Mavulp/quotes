<script setup lang='ts'>
import { onBeforeMount, onBeforeUnmount, reactive } from 'vue'
import InputText from '../form/InputText.vue'
import InputTextarea from '../form/InputTextarea.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const form = reactive({
  displayName: '',
  bio: '',
  profilePicture: '',
})

onBeforeMount(() => {
  document.body.style.overflow = 'hidden'

  // Fetch settings

  // Assign to form
})

onBeforeUnmount(() => {
  document.body.style.overflow = 'unset'
})

function submit() {

}
</script>

<template>
  <div class="modal" @click.self="emit('close')">
    <button class="modal-close" @click="emit('close')">
      <Icon code="e5cd" />
    </button>

    <div class="quote-container-small">
      <div class="modal-content quote-user-settings">
        <h2>Settings</h2>
        <div class="input-img">
          <img :src="form.profilePicture" alt=" ">
          <div>
            <strong>Profile Picture URL</strong>
            <InputText v-model:value="form.displayName" placeholder="Display Name" />
            <strong>Display Name</strong>
            <InputText v-model:value="form.profilePicture" placeholder="Profile Picture URL" />
            <strong>Bio</strong>
            <InputTextarea v-model:value="form.bio" placeholder="Bio" class="has-round" />
          </div>
        </div>

        <br>
        <div class="flex-wrap right">
          <button class="button" @click="submit">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
