<template>
  <div v-if="isLoading" class="loading-screen">
    <div class="spinner"></div>
    <p>Fetching RTA Data</p>
  </div>
  <div v-else>
    <button @click="directionLeft">left</button>
    <button @click="directionTop">top</button>
    <button @click="directionBottom">bottom</button>
    <button @click="directionRight">right</button>
    <div class="chart-container" ref="chartContainer"></div>
    <Sidebar
      :fitChart="fitChart"
      :compactChart="directionTop"
      :expandAllNodes="expandAllNodes"
      :collapseAllNodes="collapseAllNodes"
      :directionBottom="directionBottom"
      :directionTop="directionTop"
      :directionLeft="directionLeft"
      :directionRight="directionRight"
      :clearMarker="clearMarker"
      :findParent="findParent"
      :clickedNodeID="clickedNodeID"
    />
    <!-- chart node HTML -->
    <div v-for="node in orgData" :key="node.id" :id="`vue-node-${node.id}`" style="display: none">
      <NodeUI :data="node" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, type Ref } from 'vue'

import { useOrgChart } from '../common/render'
import NodeUI from './node.vue'

const chartContainer = ref<HTMLElement | null>(null)

const orgData = ref([]) as Ref<TDataType[]>
const isLoading = ref(true)

const { render, fitChart, expandAllNodes, collapseAllNodes, directionBottom, directionTop, directionLeft, directionRight, clearMarker, findParent, clickedNodeID } = useOrgChart()
type TDataType = {
  id: string
  parentId: string
  name: string
  title: string

  createdAt: string
}
const data = [
  {
    id: '1',
    parentId: '',
    name: 'RTA'
  },
  {
    id: '2',
    parentId: '1',
    name: 'ABC'
  },
  {
    id: '3',
    parentId: '1',
    name: 'XYZ'
  },
  {
    id: '4',
    parentId: '2',
    name: 'QWE'
  }
] as TDataType[]
const mock = () => new Promise<TDataType[]>(r => setTimeout(() => r(data), 1000))
onMounted(async () => {
  orgData.value = await mock()
  isLoading.value = false
  await nextTick()
  render(chartContainer.value!, orgData.value)
})
</script>
