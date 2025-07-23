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
    <input v-model="search" />
    <div class="chart-container" ref="chartContainer"></div>
    <!-- <Sidebar
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
    /> -->
    <!-- chart node HTML -->
    <div v-for="node in orgData" :key="node.id" :id="`vue-node-${node.id}`" style="display: none"></div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, watch, type Ref } from 'vue'

import { useOrgChart } from '../common/render'

const chartContainer = ref<HTMLElement | null>(null)

const orgData = ref([]) as Ref<TDataType[]>
const isLoading = ref(true)
const isReady = ref(false)
const search = ref('')

watch(
  () => [isReady.value, search.value],
  () => {
    isReady.value && filterChart?.(search.value)
  }
)

const {
  render,
  filterChart,
  chartInstance,
  fitChart,
  expandAllNodes,
  collapseAllNodes,
  directionBottom,
  directionTop,
  directionLeft,
  directionRight,
  clearMarker,
  findParent,
  clickedNodeID,
  addNode
} = useOrgChart()
export type TDataType = {
  id: string // -
  parentId: string // -
  height: number // -
  //extra...
  name: string
  on: boolean
  accent: string
}
// TNodeBase
//TDepartment = TNodeBase & ....

// node, children?:[]
//2. flatten
const data = [
  {
    id: '1',
    parentId: '',
    name: 'RTA 200',
    height: 200,
    on: true,
    accent: 'blue'
  },
  {
    id: '2',
    parentId: '1',
    name: 'ABC 400',
    height: 400,
    on: true,
    accent: 'red'
  },
  {
    id: '3',
    parentId: '1',
    name: 'XYZ 500',
    height: 500,
    on: true,
    accent: 'green'
  },
  {
    id: '4',
    parentId: '2',
    name: 'QWE 300',
    height: 300,
    on: true,
    accent: 'red'
  }
] as TDataType[]

const mock = () => new Promise<TDataType[]>(r => setTimeout(() => r(data), 1000))
onMounted(async () => {
  orgData.value = await mock()
  isLoading.value = false
  await nextTick()
  render(chartContainer.value!, orgData.value)
  await nextTick()
  isReady.value = true
})
</script>
