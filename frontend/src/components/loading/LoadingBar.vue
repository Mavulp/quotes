<template>
  <div class="loading-bar">
    <div class="loading-bar-value"></div>
  </div>
</template>

<style lang="scss" scoped>
@import "../../style/setup/variables";
@import "../../style/setup/mixins";

.loading-bar {
  @include radius(6px);
  height: 6px;
  background-color: var(--color-bg-light);
  width: 100%;
  max-width: 256px;
  overflow: hidden;

  &.loading-done {
    .loading-bar-value {
      animation: none;
    }

    &.loading-success .loading-bar-value {
      background-color: var(--color-green);
    }

    &.loading-error .loading-bar-value {
      background-color: var(--color-red);
    }
  }
}

.loading-bar-value {
  width: 100%;
  height: 100%;
  background-color: var(--color-highlight);
  animation: indeterminateAnimation 1s infinite ease-in-out;
  transform-origin: 0% 50%;
}

@keyframes indeterminateAnimation {
  0% {
    transform: translateX(0) scaleX(0);
  }
  40% {
    transform: translateX(0) scaleX(0.4);
  }
  100% {
    transform: translateX(100%) scaleX(0.5);
  }
}
</style>
