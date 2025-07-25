<template>
  <div v-if="isLoading" class="loading-screen">
    <div class="spinner"></div>
    <p>Fetching RTA Data</p>
  </div>
  <div v-else>
    <div id="actions">
      <button @click="directionLeft">left</button>
      <button @click="directionTop">top</button>
      <button @click="directionBottom">bottom</button>
      <button @click="directionRight">right</button>
      <br />
      <h4>EDIT CHART</h4>
      <button v-if="!chartInstance?.isEditMode" @click="chartInstance?.setEditMode(true)">EDIT</button>
      <template v-else>
        <button :disabled="undoActions.length == 0" @click="undo">UNDO</button>
        <button :disabled="redoActions.length == 0" @click="redo">REDO</button>
        <button @click="chartInstance?.setEditMode(false)">DONE</button>
        <button v-if="!chartInstance?.enableDrag" @click="chartInstance?.setEnableDrag(true)">Allow Drag</button>
        <button v-else @click="chartInstance?.setEnableDrag(false)">Disallow Drag</button>
      </template>
      <br />
      <h4>SEARCH</h4>
      <input v-model="search" />
    </div>
    <div class="chart-container" ref="chartContainer"></div>

    <!-- chart node HTML -->
    <div v-for="node in orgData" :key="node.id" :id="`vue-node-${node.id}`" style="display: none"></div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref, watch, type Ref } from 'vue'

import { useOrgChart } from '../common/render'

const chartContainer = ref<HTMLElement | null>(null)

const orgData = ref([]) as Ref<TDataType[]>
const isLoading = ref(true)
const isReady = ref(false)

const search = ref('')

watch(
  () => [isReady.value, search.value],
  (to, from) => {
    isReady.value && to[1] !== from[1] && filterChart?.(search.value)
  }
)

const {
  render,
  undo,
  redo,
  undoActions,
  redoActions,
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
  expanded: boolean
  accent: string
  isEditMode: boolean
}
// TNodeBase
//TDepartment = TNodeBase & ....

// node, children?:[]
//2. flatten
const data = reactive([
  {
    id: '1',
    parentId: '',
    name: 'RTA 200',
    height: 200,
    expanded: true,
    zzz: 1000,
    accent: 'blue',
    isEditMode: false
  },
  {
    id: '2',
    parentId: '1',
    name: 'ABC 400',
    height: 400,
    expanded: true,
    accent: 'red',
    isEditMode: false
  },
  {
    id: '3',
    parentId: '1',
    name: 'XYZ 500',
    height: 500,
    expanded: true,
    accent: 'green',
    isEditMode: false
  },
  {
    id: '4',
    parentId: '2',
    name: 'QWE 300',
    height: 300,
    expanded: true,
    accent: 'red',
    isEditMode: false
  }
]) as TDataType[]

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
