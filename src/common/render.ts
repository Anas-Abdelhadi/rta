import * as d3 from 'd3'

import { OrgChart, type State } from 'd3-org-chart'
import { ref, type Ref } from 'vue'

export function useOrgChart() {
  const chartInstance: Ref<OrgChart<any> | null> = ref(null)
  const clickedNodeID: Ref<string | null> = ref(null)

  const render = (container: HTMLElement, data: any[]) => {
    if (!container || !data.length) return

    const chart = new OrgChart()
      .container(container as any)
      .data(data)
      .scaleExtent([0.2, 1.75])
      .setActiveNodeCentered(true)
      .nodeHeight(() => 120)
      .nodeWidth(() => 380)
      .childrenMargin(() => 120)
      .compactMarginBetween(() => 80)
      .compactMarginPair(() => 120)
      .siblingsMargin(() => 120)
      .onNodeClick((d: d3.HierarchyNode<any>) => {
        console.log(d)
        clickedNodeID.value = d.data.id
        markNode(clickedNodeID.value!)
      })
      .nodeContent((d: d3.HierarchyNode<any>) => {
        const htmlNode = document.getElementById(`vue-node-${d.data.id}`)
        return htmlNode?.innerHTML || `<div>Missing node</div>`
      })
      .nodeUpdate(function () {
        d3.select(this )
          .select('.node-rect')
          .attr('stroke', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? '#4285F4' : 'none'))
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
      .nodeButtonWidth(() => 140)
      .nodeButtonHeight(() => 40)
      .buttonContent(({ node }: { node: d3.HierarchyNode<any>; state: State<any> }) => {
        const text = node.children ? `▲ Collapse ${node.data._directSubordinates} Nodes` : `▼ Expand ${node.data._totalSubordinates} Nodes`
        return `
          <div class="card-button" >
            ${text}
          </div>
        `
      })

      .render()
      .fit()

    d3.select(container).select('svg').attr('width', '100%').attr('height', '100vh')

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

  function markNode(nodeID:string) {
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
    clearMarker
  }
}
