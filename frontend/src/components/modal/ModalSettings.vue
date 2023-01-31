<script setup lang='ts'>
import { onBeforeMount, onBeforeUnmount, reactive } from 'vue'
import { useLoading } from '../../store/loading'
import { useUser } from '../../store/user'
import type { Settings } from '../../types/user-types'

import InputText from '../form/InputText.vue'
import InputTextarea from '../form/InputTextarea.vue'

const user = useUser()
const loading = useLoading()
const form = reactive<Omit<Settings, 'colorTheme'>>({
  bio: '',
  profilePicture: '',
  highlightedQuoteId: null,
})

onBeforeMount(async () => {
  await user.fetchSettings()

  // Assign to form
  // TODO: once we implement color theme, just use Object.assign()
  form.bio = user.settings.bio
  form.profilePicture = user.settings.profilePicture
  form.highlightedQuoteId = user.settings.highlightedQuoteId
})

// onBeforeUnmount(() => {
// })

// Submit form
async function submit() {
  user.updateSettings(form)
}
</script>

<template>
  <div class="quote-container-small">
    <div class="modal-content quote-user-settings">
      <div v-if="loading.get('settings')" style="height:256px">
        <Spinner />
      </div>
      <template v-else>
        <h2>Settings</h2>
        <div class="input-img">
          <div class="wrap">
            <img :src="form.profilePicture" alt=" " style="margin-bottom: 20px;">
          </div>
          <div>
            <strong>Profile Picture</strong>
            <InputText v-model:value="form.profilePicture" placeholder="Profile Picture URL" />
            <strong>Bio (markdown supported)</strong>
            <InputTextarea v-model="form.bio" placeholder="Bio" class="has-round" />
            <strong>Highlighted Quote</strong>
            <p>
              You can highlight any quote, which will display it on your profile. To do that, go to a quote detail and click the bookmark button.
            </p>
            <div class="flex-wrap">
              <button v-if="form.highlightedQuoteId" class="button wide btn-red" @click="form.highlightedQuoteId = null">
                <Icon code="e5cd" size="1.8" />
                Remove
              </button>
              <!-- <button v-else class="button wide btn-gray-light" @click="closeModalAndGoToList">
                <Icon code="e867" size="1.8" />
                Add
              </button> -->
            </div>

            <hr>

            <div class="flex-wrap">
              <button class="button semiwide" @click="submit">
                Save
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
