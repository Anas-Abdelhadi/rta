<script setup lang="ts">
import { computed } from 'vue'
import type { TDataType } from './chart.vue'

const props = defineProps<{
  node?: d3.HierarchyNode<TDataType>
}>()

// Generate a random image (not stored in the data object)
const imageUrl = computed(() => {
  const seed = encodeURIComponent(props.node?.data?.id || props.node?.data?.name || 'default')
  return `https://picsum.photos/seed/${seed}/100/100`
})

const emits = defineEmits(['add', 'changeHeight', 'toggle'])
const click = e => {
  debugger
  e.stopPropagation()
  e.preventDefault()
  console.log(e)
  emits('add', e)
}

const changeHeight = e => {
  debugger
  e.stopPropagation()
  e.preventDefault()
  console.log(e)

  emits('changeHeight', !props.node?.data?.on)
}
const toggle = e => {
  debugger
  e.stopPropagation()
  e.preventDefault()
  console.log(e)

  emits('toggle', !props.node?.data.on)
}

const computedStyle = computed(() => ({
  // height: data.value ? `${data.value.on ? data.value.height : 150}px` : 0,
  borderColor: props.node?.data?._highlighted ? 'red' : 'white'
  //background: data?.value?.accent ?? 'white'
}))
</script>

<template>
  <div class="card-ui" role="region" aria-label="Node Card" :style="computedStyle">
    <div class="band" :style="{ background: node?.data?.accent ?? 'white' }"></div>
    {{ node?.data?._highlighted ? 'true' : 'false' }}
    <button @click="click">press</button>

    <!-- Header -->

    <div class="card-header">
      <div style="display: flex; justify-content: center">
        <img :src="imageUrl" alt="..." class="image" />
      </div>
      <div class="card-title">{{ node?.data?.name }}</div>
    </div>
    <!-- Details -->
    <div class="card-details">
      <button class="card-button" @click="toggle">{{ node?.data.on ? 'collapse' : 'expand' }}</button>
    </div>
  </div>
</template>
