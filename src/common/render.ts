import * as d3 from 'd3'

import { OrgChart, type State } from 'd3-org-chart'
import { nextTick, ref, type Ref } from 'vue'
import { createApp } from 'vue'
import NodeUI from '../components/node.vue'
const mock = () => new Promise<void>(r => setTimeout(() => r(), 300))
const vueAppCache = new Map<string, { app: ReturnType<typeof createApp>; dataRef: Ref<any> }>()
const nodes = new Map<string, d3.HierarchyNode<any>>()

async function mountVueNodes(data: any[], chart: CubesOrgChart ) {
  data.forEach(node => {
    const id = node.id
    const mountPoint = document.getElementById(`vue-node-mount-${id}`)

    if (!mountPoint) return

    if (vueAppCache.has(id)) {
      // App is mounted: update props via ref
      vueAppCache.get(id)!.dataRef.value = node
    }

    const dataRef = ref(node)
    const app = createApp(NodeUI, {
      data: dataRef,
      node: nodes.get(node.id)!,
      onToggle: (on:boolean) => {
        chart.updateNodeHeight(node.id,on)
      },
      onAdd: async () => {
        const id = `${Math.random().toString(36).slice(2)}`
        chart.duration(0)
        chart.setExpanded(node.id, true)
        chart.expand(nodes.get(node.id)!)
        chart.addNode({ ...node, parentId: node.id, id })

        chart.render()

        await nextTick()
        chart.duration(650) //.setCentered(id).render()
        await mock()
        chart.fit({ nodes: [nodes.get(node.id)!, nodes.get(id)!] })
      }
    })

    vueAppCache.set(id, { app, dataRef })
    app.mount(mountPoint)
  })
  // await nextTick()
  // chart.duration(650)  .fit()
}

function unmountVueNodes(currentIds: Set<string>) {
  for (const [id, { app }] of vueAppCache.entries()) {
    if (!currentIds.has(id)) {
      app.unmount()
      vueAppCache.delete(id)
    }
  }
}

function updateNodeData(id: string, patch: Partial<any>) {
  const cached = vueAppCache.get(id)
  if (cached) Object.assign(cached.dataRef.value, patch)
}

class CubesOrgChart extends OrgChart<any> {
  updateNodeHeight(nodeId: string, on:boolean) {
    const data = vueAppCache.get(nodeId)
    
     
    data!.dataRef.value.on = on
      
    this.updateNodesState()
    this.render().fit() 
  }

  render() {
    const data = this.data() ?? []
    const currentIds = new Set(data.map(d => d.id))

    // Clean old apps first
    unmountVueNodes(currentIds)

    super.render()

    // Mount new ones after DOM is updated
    mountVueNodes(data, this)

    return this
  }
}
export function useOrgChart() {
  const chartInstance: Ref<OrgChart<any> | null> = ref(null)
  const clickedNodeID: Ref<string | null> = ref(null)

  const render = (container: HTMLElement, data: any[]) => {
    if (!container || !data.length) return

    const chart = new CubesOrgChart()
      .container(container as any)
      .data(data)
      .scaleExtent([0.2, 1.75])
      .setActiveNodeCentered(true)
      .nodeHeight(node => node.data.on?node.data.height:150)
      .nodeWidth(() => 380)
      .childrenMargin(() => 120)
      .compactMarginBetween(() => 80)
      .compactMarginPair(() => 120)
      .siblingsMargin(() => 120)
      .onNodeClick((d: d3.HierarchyNode<any>, ...rest) => {
        console.log(d, rest)
        clickedNodeID.value = d.data.id
        markNode(clickedNodeID.value!)
      })
      .nodeContent((d: d3.HierarchyNode<any>) => {
        nodes.set(d.data.id, d)
        return `<div id="vue-node-mount-${d.data.id}" class="vue-node-placeholder"></div>`
      })
      .nodeUpdate(function () {
        d3.select(this)
          .select('.node-rect')
          // .attr('stroke', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? '#4285F4' : 'none'))
          .attr('stroke', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? 'none' : 'none'))
          .attr('stroke-width', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? 4 : 2))
          .attr('stroke-linejoin', 'round')
          .style('stroke-alignment', 'outer')
      })
      .linkUpdate(function (d: any) {
        d3.select(this)
          .attr('stroke', (d: any) => (d.data._upToTheRootHighlighted ? '#4285F4' : '#1E1C8A'))
          .attr('stroke-width', (d: any) => (d.data._upToTheRootHighlighted ? 4 : 2))
        if (d.data._upToTheRootHighlighted) d3.select(this).raise()
      })

      .nodeButtonX(() => -70)
      .nodeButtonWidth(() => 120)
      .nodeButtonHeight(() => 40)
      .buttonContent(({ node }: { node: d3.HierarchyNode<any>; state: State<any> }) => {
        const text = node.children ? `▲ Collapse (${node.data._directSubordinates})` : `▼ Expand (${node.data._directSubordinates})`
        return `
          <div class="card-button" >
            ${text}
          </div>
        `
      })
      .duration(650)
      .compact(false)

      .render()
      .fit()

    d3.select(container).select('svg').attr('width', '100%').attr('height', '100vh')
    chart.onExpandOrCollapse(d => {
      //todo: remove hidden!

      mountVueNodes(data, chart as CubesOrgChart)
    })
    chartInstance.value = chart
  }

  const fitChart = () => chartInstance.value?.fit()
  const directionTop = () => {
    chartInstance.value?.compact(true).layout('top').render().fit()
  }
  const directionLeft = () => {
    chartInstance.value?.layout('left').render().fit()
  }
  const directionRight = () => {
    chartInstance.value?.layout('right').render().fit()
  }
  const directionBottom = () => {
    chartInstance.value?.layout('bottom').render().fit()
  }
  const expandAllNodes = () => chartInstance.value?.expandAll().fit()
  const collapseAllNodes = () => chartInstance.value?.collapseAll().fit()

  const isMarked = ref(false)

  function markNode(nodeID: string) {
    if (isMarked.value) {
      isMarked.value = false
      chartInstance.value?.clearHighlighting?.().render()
    } else {
      chartInstance.value?.setHighlighted(nodeID).render()
      isMarked.value = true
    }
  }
  function findParent() {
    if (!clickedNodeID.value || !chartInstance.value) return
    chartInstance.value?.setUpToTheRootHighlighted(clickedNodeID.value).render()
  }

  function clearMarker() {
    isMarked.value = false
    clickedNodeID.value = null
    chartInstance.value?.clearHighlighting?.().render()
  }

  const addNode = (newNode: any) => {
    debugger
    chartInstance.value?.addNode(newNode).render()
  }

  return {
    chartInstance,
    clickedNodeID,
    render,
    fitChart,
    directionLeft,
    expandAllNodes,
    collapseAllNodes,
    directionTop,
    directionBottom,
    directionRight,
    findParent,
    clearMarker,
    addNode,
     
  }
}
