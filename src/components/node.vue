<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'

const props = withDefaults(defineProps<{ data: any }>(), {
  data: {}
})

// Generate a random image (not stored in the data object)
const seed = encodeURIComponent(props.data.id || props.data.name || 'default')
const imageUrl = `https://picsum.photos/seed/${seed}/100/100`
</script>

<template>
  <div class="card-ui" role="region" aria-label="Node Card">
    <!-- <div class="bg"></div> -->

    <!-- Header -->
    <div class="card-header">
      <div style="display: flex; justify-content: center">
        <img :src="imageUrl" alt="..." class="image" />
      </div>
      <div class="card-title">{{ props.data.name }}</div>
    </div>
    <!-- Details -->
    <div class="card-details"></div>
  </div>
</template>
