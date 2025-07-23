<script setup lang="ts">
import { computed, type Ref } from 'vue'
import type { TDataType } from './chart.vue'

const props = defineProps<{
  data: Ref<TDataType>
  node?: d3.HierarchyNode<any>
}>()

// Generate a random image (not stored in the data object)
const imageUrl = computed(() => {
  const seed = encodeURIComponent(props.data.value?.id || props.data.value?.name || 'default')
  return `https://picsum.photos/seed/${seed}/100/100`
})

const emits = defineEmits(['add', 'toggle'])
const click = e => {
  debugger
  e.stopPropagation()
  e.preventDefault()
  console.log(e)
  emits('add', e)
}

const toggle = e => {
  debugger
  e.stopPropagation()
  e.preventDefault()
  console.log(e)

  emits('toggle', !data.value.on)
}
const data = computed(() => props.data.value)
console.log('>>> ', data.value)

const computedStyle = computed(() => ({
  height: data.value ? `${data.value.on ? data.value.height : 150}px` : 0,
  borderColor: props.node?.data?._highlighted ? 'red' : 'white'
  //background: data?.value?.accent ?? 'white'
}))
</script>

<template>
  <component :is="?????"></component>
  <div class="card-ui" role="region" aria-label="Node Card" :style="computedStyle">
    <div class="band" :style="{ background: data?.accent ?? 'white' }"></div>
    {{ node?.data?._highlighted ? 'true' : 'false' }}
    <button @click="click">press</button>
    <button @click="toggle">toggle</button>
    <!-- Header -->

    <div class="card-header">
      <div style="display: flex; justify-content: center">
        <img :src="imageUrl" alt="..." class="image" />
      </div>
      <div class="card-title">{{ data?.name }}</div>
    </div>
    <!-- Details -->
    <div class="card-details"></div>
  </div>
</template>
