import * as d3 from 'd3'

import { OrgChart } from 'd3-org-chart'
import { nextTick, ref, type Ref } from 'vue'
import { createApp } from 'vue'
import NodeUI from '../components/node.vue'
import { mainApp } from '../main'
import type { TDataType } from '../components/chart.vue'
const mock = () => new Promise<void>(r => setTimeout(() => r(), 300))
const vueAppCache = new Map<string, ReturnType<typeof createApp>>()

async function mountVueNodes(chart: CubesOrgChart) {
  ;(chart.getChartState().allNodes ?? []).forEach(node => {
    const id = node.data.id

    const mountPoint = document.getElementById(`vue-node-mount-${id}`)
    //  // sync data
    //if (node.children) node.data.expanded = node.children?.every(x => x.data._expanded)
    console.log('Node ID ', node.data.id, 'EXPANDED ', node.data.expanded)

    //else node.data.expanded= node.data._expanded

    if (!mountPoint) return

    if (vueAppCache.has(id)) {
      // App is mounted: update props via ref
      const app = vueAppCache.get(id)!
      //app.dataRef.value = node
      app.unmount()
      vueAppCache.delete(id)
    }
    node.data.expanded = node.children?.every(x => x.data._expanded)
    const app = createApp(NodeUI, {
      node,
      // onToggle: (on: boolean) => {
      //   chart.updateNodeHeight(node.id, on)
      // },
      onToggle: (node: any) => {
        debugger
        //_directSubordinates
        // nodes.set(node.id!, { ...node, on })
        chart.toggle(node)
      },
      onAdd: async () => {
        let n = node
        const id = `${Math.random().toString(36).slice(2)}`
        chart.duration(0)
        debugger
        chart.setExpanded(n.id!, true)
        chart.expand(n)
        !n.data.expanded && chart.toggle(n)
        chart.addNode({ ...n, parentId: n.id, id })
        chart.updateNodesState()
        chart.render()

        await nextTick()
        chart.duration(650) //.setCentered(id).render()
        await mock()

        chart.fit({ nodes: [node] })
        //chart.fit({ nodes: chart.getNodeChildren(n ,[]).map(x=> x.id)  })
      }
    })
    Object.assign(app._context, mainApp._context)
    vueAppCache.set(id, app)
    app.mount(mountPoint)
  })

  // await nextTick()
  // chart.duration(650)  .fit()
}

// function unmountVueNodes(currentIds: Set<string>) {
//   for (const [id, { app }] of vueAppCache.entries()) {
//     if (currentIds.has(id)) {
//       app.unmount()
//       vueAppCache.delete(id)
//     }
//   }
// }

export class CubesOrgChart extends OrgChart<any> {
  // updateNodeHeight(nodeId: string, on: boolean) {
  //   const data = vueAppCache.get(nodeId)

  //   this.updateNodesState()
  //   this.render().fit()
  // }

  // render() {

  //   const data =  this.data() ?? []
  //   //const currentIds = new Set(data.map(d => d.id))

  //   // Clean old apps first
  //   //unmountVueNodes(currentIds)

  //   super.render()

  //   // Mount new ones after DOM is updated
  //

  //   return this
  // }
  isEditMode: boolean = false
  enableDrag: boolean = false
  setEnableDrag(canDrag: boolean) {
    this.enableDrag = canDrag
    this.render()
  }
  sync() {
    ;(this.getChartState().allNodes ?? []).forEach(node => {
      //  // sync data
      if (node.children) node.data.expanded = node.children?.every(x => x.data._expanded)
      console.log('Node ID ', node.data.id, 'EXPANDED ', node.data.expanded)
    })
    this.updateNodesState()
    this.data(this.getChartState().data).render()
  }
  setEditMode(isEdit: boolean) {
    this.isEditMode = isEdit
    this.render()
  }
  toggle(node: any) {
    debugger
    if (!node) return

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })

    this.onButtonClick(clickEvent, node)
   
    node.data.expanded = node.children?.every(x => x.data._expanded)
     
    this.fit()
  }
  render() {
    //const cache = Array.from(vueAppCache.values()).map(({ dataRef }) => dataRef.value)
    // const data = this.data()??[]//cache.length?cache:this.data()??[]
    // update the chart’s dataset from latest reactive values
    //this.data(data)

    // draw chart using updated data
    super.render()

    // re-mount Vue components
    mountVueNodes(this)
    // ;(this.getChartState().allNodes ?? []).forEach(node => {
    //   //  // sync data
    //   if (node.children) node.data.expanded = node.children?.every(x => x.data._expanded)
    //   console.log('Node ID ', node.data.id, 'EXPANDED ', node.data.expanded)
    // })
    return this
  }
}
export type THistoryAction = { id: string; parentId: string }
export function useOrgChart() {
  const chartInstance: Ref<CubesOrgChart | null> = ref(null)
  const clickedNodeID: Ref<string | null> = ref(null)
  ////////////

  let dragNode: d3.HierarchyNode<TDataType> | null,
    dropNode: d3.HierarchyNode<TDataType> | null,
    dragStartX: number,
    dragStartY: number,
    isDragStarting = false,
    undoActions = ref([] as THistoryAction[]),
    redoActions = ref([] as THistoryAction[])

  ////////////////

  const render = (container: HTMLElement, data: any[]) => {
    if (!container || !data.length) return

    const chart = new CubesOrgChart()
      .initialExpandLevel(0)
      .container(container as any)
      .data(data)

      .scaleExtent([0.2, 1.75])
      //.setActiveNodeCentered(true)
      .nodeHeight(node => node.data.height)
      .nodeWidth(() => 380)
      .childrenMargin(() => 120)
      .compactMarginBetween(() => 80)
      .compactMarginPair(() => 120)
      .siblingsMargin(() => 120)
      .onNodeClick((d: d3.HierarchyNode<TDataType>, ...rest) => {
        console.log(d, rest)
        clickedNodeID.value = d.data.id
        markNode(clickedNodeID.value!)
      })
      // .nodeExit(function(d: d3.HierarchyNode<TDataType>){
      //   console.log('>>> ',d)
      // })
      .nodeContent((d: d3.HierarchyNode<TDataType>) => {
        console.log('$$$$$ ', d.id, d)

        //d.data._expanded = d.data.on

        return `<div id="vue-node-mount-${d.data.id}" class="vue-node-placeholder"></div>`
      })
      .nodeEnter(function (d: d3.HierarchyNode<TDataType>) {
        //d.data.on = d.data._expanded

        d3.select(this).call(
          d3
            .drag()
            .filter(function () {
              return !!chartInstance.value?.enableDrag && this.classList.contains('draggable')
            })
            .on('start', function (d, node: any) {
              onDragStart(this, d, node)
            })
            .on('drag', function (dragEvent) {
              onDrag(this, dragEvent)
            })
            .on('end', function (d) {
              onDragEnd(this, d)
            })
        )
      })
      .nodeUpdate(function (d: d3.HierarchyNode<TDataType>) {
        debugger
        console.log('>>> ' + d.id, d)
        console.log('>>> ', chartInstance.value?.getChartState())
        if (chartInstance.value) {
          d.data.isEditMode = chartInstance.value!.isEditMode
        }

        d3.select(this)
          .select('.node-rect')
          // .attr('stroke', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? '#4285F4' : 'none'))
          .attr('stroke', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? 'none' : 'none'))
          .attr('stroke-width', (d: any) => (d.data._highlighted || d.data._upToTheRootHighlighted ? 4 : 2))
          .attr('stroke-linejoin', 'round')
          .style('stroke-alignment', 'outer')
        //// set drag drop flags/classes
        if (d.id === '1') {
          d3.select(this).classed('draggable', false)
        } else {
          d3.select(this).classed('droppable draggable', true)
        }

        // drag drop

        d3.select(this).select('.node-button-g').remove()
      })
      .linkUpdate(function (d: any) {
        d3.select(this).attr('stroke', (d: any) => (d.data._upToTheRootHighlighted ? '#464646ff' : '#888888ff'))
        //.attr('stroke-width', (d: any) => (d.data._upToTheRootHighlighted ? 4 : 2))
        if (d.data._upToTheRootHighlighted) d3.select(this).raise()
      })

      // .nodeButtonX(() => -20)
      // .nodeButtonY(() => -10)
      // .nodeButtonWidth(() => 40)
      // .nodeButtonHeight(() => 20)
      // .buttonContent(({ node }: { node: d3.HierarchyNode<TDataType>; state: State<any> }) => {
      //   const text = node.children ? `-` : `+`
      //   return `
      //     <div class="card-button" >
      //       ${text}
      //     </div>
      //   `
      // })

      .duration(650)
      .compact(false)

      .render()
      .fit()

    // ;(chart.getChartState().allNodes ?? []).forEach(node => {
    //   //  // sync data
    //   if (node.children) node.data.expanded = node.children?.every(x => x.data._expanded)
    //   console.log('Node ID ', node.data.id, 'EXPANDED ', node.data.expanded)
    // })

    d3.select(container).select('svg').attr('width', '100%').attr('height', '100vh')
    chart.onExpandOrCollapse(() => {
      // //todo: remove hidden!
      //  unmountVueNodes(currentIds)

      mountVueNodes(chart as CubesOrgChart)
      // ;(chart.getChartState().allNodes ?? []).forEach(node => {
      //   //  // sync data
      //   if (node.children) node.data.expanded = node.children?.every(x => x.data._expanded)
      //   console.log('Node ID ', node.data.id, 'EXPANDED ', node.data.expanded)
      // })
      // /////
      // ;(chart.getChartState().allNodes ?? []).forEach(node => {
      //   //  // sync data
      //   if (node.children) node.data.expanded = node.children?.every(x => x.data._expanded)
      //   debugger
      // })

      /////
      debugger
      //chart.render()
    })
    chartInstance.value = chart as CubesOrgChart
    chartInstance.value.expandAll().fit()
    chartInstance.value.sync()
  }

  const fitChart = () => chartInstance.value?.fit()
  const directionTop = () => {
    chartInstance.value?.compact(false).layout('top').render().fit()
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
  let originalData: any = undefined
  async function filterChart(value: string) {
    debugger
    // Clear previous higlighting
     
    chartInstance.value?.clearHighlighting ()
    if (value.trim().length) {
      if (originalData === undefined) {
        originalData = [...(chartInstance.value?.data() ?? [])]
      }
    } else {
      chartInstance.value?.data(originalData)
      await nextTick()
       chartInstance.value?.expandAll().fit()
      chartInstance.value?.sync()
      
      originalData = undefined
      return
    }
    console.log('value search... ', value)

    // Get chart nodes
    const data = chartInstance.value?.data() ?? []

    // Mark all previously expanded nodes for collapse
    data.forEach(d => {
      d._expanded = false
      d.expanded = false
    })

    // Loop over data and check if input value matches any name
    data.forEach(d => {
      if (value != '' && d.name.toLowerCase().includes(value.toLowerCase())) {
        // If matches, mark node as highlighted
        d._highlighted = true
        d._expanded = true
        d.expanded = true
      }
    })

    // Update data and rerender graph

    chartInstance.value?.data(data).render().fit()
  }

  ///DRAG DROP
  function onDragStart(element: Element, dragEvent: any, node: d3.HierarchyNode<TDataType>) {
    dragNode = node
    const width = dragEvent.subject.width
    const half = width / 2
    const x = dragEvent.x - half
    dragStartX = x
    dragStartY = parseFloat(dragEvent.y)
    isDragStarting = true

    d3.select(element).classed('dragging', true)
  }

  function onDrag(element: Element, dragEvent: any) {
    if (!dragNode) {
      return
    }

    const state = chartInstance.value?.getChartState()
    const g = d3.select(element)

    // This condition is designed to run at the start of a drag only
    if (isDragStarting) {
      isDragStarting = false
      document!.querySelector('.chart-container')!.classList.add('dragging-active')

      // This sets the Z-Index above all other nodes, by moving the dragged node to be the last-child.
      g.raise()

      const descendants = dragEvent.subject.descendants()
      const linksToRemove = [...(descendants || []), dragEvent.subject]
      const nodesToRemove = descendants.filter(x => x.data.id !== dragEvent.subject.id)

      // Remove all links associated with the dragging node
      state?.['linksWrapper']
        .selectAll('path.link')
        .data(linksToRemove, (d: any) => state.nodeId(d))
        .remove()

      // Remove all descendant nodes associated with the dragging node
      if (nodesToRemove) {
        state?.['nodesWrapper']
          .selectAll('g.node')
          .data(nodesToRemove, (d: any) => state.nodeId(d))
          .remove()
      }
    }

    dropNode = null
    const cP = {
      width: dragEvent.subject.width,
      height: dragEvent.subject.height,
      left: dragEvent.x,
      right: dragEvent.x + dragEvent.subject.width,
      top: dragEvent.y,
      bottom: dragEvent.y + dragEvent.subject.height,
      midX: dragEvent.x + dragEvent.subject.width / 2,
      midY: dragEvent.y + dragEvent.subject.height / 2
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const allNodes = d3.selectAll('g.node:not(.dragging)')
    allNodes.select('rect').attr('fill', 'none')

    allNodes
      .filter(function (d2: any) {
        const cPInner = {
          left: d2.x,
          right: d2.x + d2.width,
          top: d2.y,
          bottom: d2.y + d2.height
        }

        if (cP.midX > cPInner.left && cP.midX < cPInner.right && cP.midY > cPInner.top && cP.midY < cPInner.bottom && (this as any)?.classList.contains('droppable')) {
          dropNode = d2
          return d2
        }
      })
      .select('rect')
      .attr('fill', '#e4e1e1')

    dragStartX += parseFloat(dragEvent.dx)
    dragStartY += parseFloat(dragEvent.dy)
    g.attr('transform', 'translate(' + dragStartX + ',' + dragStartY + ')')
  }

  function onDragEnd(element: Element, dragEvent: any) {
    document.querySelector('.chart-container')?.classList.remove('dragging-active')
    if (!dragNode) {
      return
    }

    d3.select(element).classed('dragging', false)

    if (!dropNode) {
      chartInstance.value?.render()
      return
    }

    if (dragEvent.subject.parent.id === dropNode.id) {
      chartInstance.value?.render()
      return
    }

    d3.select(element).remove()

    const data = chartInstance.value?.getChartState().data
    const node = data?.find(x => x.id === dragEvent.subject.id)
    const oldParentId = node.parentId
    node.parentId = dropNode.id

    redoActions.value = []
    undoActions.value.push({
      id: dragEvent.subject.id,
      parentId: oldParentId
    })

    dropNode = null
    dragNode = null
    chartInstance.value?.render()
    //updateDragActions();
  }

  function disableDrag() {
    chartInstance.value?.setEnableDrag(false)

    undoActions.value = []
    redoActions.value = []
    //updateDragActions();
  }

  function cancelDrag() {
    if (undoActions.value.length === 0) {
      disableDrag()
      return
    }

    const data = chartInstance.value?.getChartState().data
    undoActions.value.reverse().forEach(action => {
      const node = data?.find(x => x.id === action.id)
      node.parentId = action.parentId
    })

    disableDrag()
    chartInstance.value?.render()
  }

  function undo() {
    const action = undoActions.value.pop()
    if (action) {
      const node = chartInstance.value?.getChartState().data?.find(x => x.id === action.id)
      const currentParentId = node.parentId
      const previousParentId = action.parentId
      action.parentId = currentParentId
      node.parentId = previousParentId

      redoActions.value.push(action)
      chartInstance.value?.render()
      // updateDragActions();
    }
  }

  function redo() {
    const action = redoActions.value.pop()
    if (action) {
      const node = chartInstance.value?.getChartState().data?.find(x => x.id === action.id)
      const currentParentId = node.parentId
      const previousParentId = action.parentId
      action.parentId = currentParentId
      node.parentId = previousParentId
      undoActions.value.push(action)
      chartInstance.value?.render()
      // updateDragActions();
    }
  }

  //
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
    filterChart,
    undoActions,
    redoActions,
    undo,
    redo
  }
}
