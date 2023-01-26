<script setup lang='ts'>
import { useEventListener } from '@vueuse/core'
import { onBeforeMount, onBeforeUnmount, reactive } from 'vue'
import { useLoading } from '../../store/loading'
import { useUser } from '../../store/user'
import type { EditableSettings } from '../../types/user-types'

import InputText from '../form/InputText.vue'
import InputTextarea from '../form/InputTextarea.vue'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const user = useUser()
const loading = useLoading()
const form = reactive<EditableSettings>({
  bio: '',
  profilePicture: '',
})

onBeforeMount(async () => {
  await user.fetchSettings()

  document.body.style.overflow = 'hidden'

  // Assign to form
  form.bio = user.settings.bio
  form.profilePicture = user.settings.profilePicture
})

onBeforeUnmount(() => {
  document.body.style.overflow = 'unset'
})

useEventListener('keydown', ({ key }) => {
  if (key === 'Escape')
    emit('close')
})

// Submit form
function submit() {
  user.updateSettings(form)
}
</script>

<template>
  <div class="modal" @click.self="emit('close')">
    <button class="modal-close" @click="emit('close')">
      <Icon code="e5cd" />
    </button>

    <div class="quote-container-small">
      <div class="modal-content quote-user-settings">
        <div v-if="loading.get('settings')" style="height:256px">
          <Spinner />
        </div>
        <template v-else>
          <h2>Settings</h2>
          <div class="input-img">
            <img :src="form.profilePicture" alt=" ">
            <div>
              <strong>Profile Picture</strong>
              <InputText v-model:value="form.profilePicture" placeholder="Profile Picture URL" />
              <strong>Bio</strong>
              <InputTextarea v-model="form.bio" placeholder="Bio" class="has-round" />
            </div>
          </div>

          <br>
          <div class="flex-wrap right">
            <button class="button" @click="submit">
              Save
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
