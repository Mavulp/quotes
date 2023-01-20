<script setup lang="ts">
import { computed, onMounted, reactive, ref, useAttrs, useSlots, watch } from 'vue'

const props = defineProps<Props>()
const attrs = useAttrs()
const slots = useSlots()

interface Tab {
  key: string
  label: string
}

type PropsTab = Tab | string

interface Props {
  tabs: PropsTab[]
}

// Serialize the tab buttons to use the same format
const formattedButtons = computed<Tab[]>(() => {
  return props.tabs.map((tab: PropsTab) => {
    // If type is Tab do nothing, else convert to <Tab>
    if (typeof tab !== 'string')
      return tab
    return { key: tab, label: tab }
  })
})

// By default set the first item as active
const active = ref<string>(formattedButtons.value[0].key)

function setActive(key: string) {
  if (active.value !== key)
    active.value = key
}

// Calculate position of active element
// Save buttons as template ref so we can read their width
const buttons = ref<Element[]>()
const tabswrap = ref<Element>()
const underline = reactive({ width: '0px', left: '0px' })

onMounted(() => {
  watch(
    active,
    (activeKey) => {
      const index = formattedButtons.value.findIndex(tab => tab.key === activeKey)

      if (buttons.value && tabswrap.value) {
        const { width, left } = buttons.value[index].getBoundingClientRect()
        const parent = tabswrap.value.getBoundingClientRect().left

        Object.assign(underline, {
          width: `${width}px`,
          left: `${left - parent}px`,
        })
      }
    },
    { immediate: true },
  )
})
</script>

<template>
  <div class="fusion-tabs" v-bind="attrs">
    <div ref="tabswrap" class="fusion-tabs-buttons">
      <button
        v-for="btn in formattedButtons"
        ref="buttons"
        :key="btn.key"
        :class="{ 'tab-active': btn.key === active }"
        class="fusion-tab-button"
        @click="setActive(btn.key)"
        v-html="btn.label"
      />

      <div class="fusion-tabs-underline" :style="underline" />
    </div>
  </div>

  <transition name="tab" mode="out-in">
    <div :key="active">
      <template v-for="(_, slot) in slots" :key="slot">
        <slot v-if="active === slot" :name="slot" />
      </template>
    </div>
  </transition>
</template>

<style scoped lang="scss">
// SECTION
// The name "fusion" is an idea for a generic library used for Mavulp / Personal
// projects. It will be composed at some point in the future from these little
// crumbs of fusion component used in various project

// TODO: the mixin folder for the fusion framework would contain the relevant mixins as well
@import "../style/setup/mixins";

.fusion-tabs {
  display: block;
  width: 100%;
  padding-bottom: 20px;

  .fusion-tabs-buttons {
    @include flex();
    position: relative;
    padding-bottom: 4px;

    .fusion-tab-button {
      @include t(0.3s, cubic-bezier(0.83, 0, 0.17, 1));
      display: block;
      padding: 0 20px;
      font-size: 1.6rem;
      height: 40px;
      line-height: 40px;
      color: var(--color-text-light);

      &:hover:not(.tab-active) {
        color: var(--color-text);
      }

      &.tab-active {
        color: var(--color-highlight);
      }
    }

    .fusion-tabs-underline {
      @include t(0.3s, cubic-bezier(0.83, 0, 0.17, 1));
      @include radius(4px);
      display: block;
      height: 4px;
      bottom: 0;
      background-color: var(--color-highlight);
      position: absolute;
    }
  }
}
</style>
