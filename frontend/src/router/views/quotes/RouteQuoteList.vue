<script setup lang="ts">
import InputCheckbox from "../../../components/form/InputCheckbox.vue";
import InputSelect from "../../../components/form/InputSelect.vue";
import InputText from "../../../components/form/InputText.vue";
import InputTextarea from "../../../components/form/InputTextarea.vue";
import Search from "../../../components/form/Search.vue";

import { reactive, ref } from "vue";

const search = ref("");
</script>

<template>
  <div class="quote-route-list">
    <div class="quote-list-header">
      <div class="quote-container">
        <div class="quote-title-wrap">
          <h1>Quote list</h1>
          <button class="button">Random</button>
        </div>

        <div class="quote-title-wrap">
          <Search placeholder="Search for a quote" v-model:value="search" />

          <!-- <InputCheckbox placeholder="Select" v-model:select="" /> -->
        </div>
      </div>
    </div>
  </div>
</template>
