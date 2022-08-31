<script setup lang="ts">
import { ref, reactive, computed } from "vue"
import { useCreate } from "../../../store/create"

const create = useCreate()
</script>

<template>
  <div>
    <pre>
      {{ create.form }}
    </pre>
  </div>
</template>
