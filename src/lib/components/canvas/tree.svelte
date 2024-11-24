<script lang="ts">
	import { writable } from 'svelte/store';
	import dagre from '@dagrejs/dagre';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		Position,
		type Node,
		type Edge,
		ConnectionLineType,
		ConnectionMode
	} from '@xyflow/svelte';
	import type { CourseRequirementDetails } from '$lib/types';
	import node from './node.svelte';

	import '@xyflow/svelte/dist/style.css';

	export let course: CourseRequirementDetails;

	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	const nodeWidth = 400;
	const nodeHeight = 200;

	const nodesStore = writable<Node[]>([]);

	const edgesStore = writable<Edge[]>([]);

	function getLayoutedElements(nodes: Node[], edges: Edge[]) {
		dagreGraph.setGraph({ rankdir: 'TB' });

		nodes.forEach((node) => {
			dagreGraph.setNode(node.id, {
				width: nodeWidth,
				height: nodeHeight
			});
		});

		edges.forEach((edge) => {
			dagreGraph.setEdge(edge.source, edge.target);
		});

		dagre.layout(dagreGraph);

		nodes.forEach((node) => {
			const nodeWithPosition = dagreGraph.node(node.id);
			node.targetPosition = Position.Top;
			node.sourcePosition = Position.Bottom;
			node.position = {
				x: nodeWithPosition.x - nodeWidth / 2,
				y: nodeWithPosition.y - nodeHeight / 2
			};
		});

		return {
			nodes: nodes,
			edges: edges
		};
	}

	function createNodesAndEdges(course: CourseRequirementDetails) {
		const nodes: Node[] = [];
		const edges: Edge[] = [];
		const visited = new Set<string>();

		function addCourseNode(course: CourseRequirementDetails, level: number, isRoot = false) {
			if (visited.has(course.id)) return;
			visited.add(course.id);

			nodes.push({
				id: course.id,
				type: 'courseNode',
				data: {
					...course,
					isRoot,
					isLeaf: !course.prerequisites || course.prerequisites.length === 0
				},
				position: { x: 0, y: 0 }
			});

			if (course.prerequisites && course.prerequisites.length > 0) {
				course.prerequisites.forEach((prereq, _index) => {
					addCourseNode(prereq as CourseRequirementDetails, level + 1, false);
					edges.push({
						id: `${course.id}-${prereq.id}`,
						source: course.id.toString(),
						target: prereq.id.toString()
					});
				});
			}
		}

		addCourseNode(course, 0, true);

		return { nodes, edges };
	}

	$: {
		const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(course);
		const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
			initialNodes,
			initialEdges
		);
		nodesStore.set(layoutedNodes);
		edgesStore.set(layoutedEdges);
	}
	const nodeTypes = {
		courseNode: node
	};
</script>

<div class="h-full w-full rounded-lg border-2 border-stone-200 bg-white">
	<SvelteFlow
		class="py-4"
		nodes={nodesStore}
		edges={edgesStore}
		{nodeTypes}
		connectionLineType={ConnectionLineType.SmoothStep}
		defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
		fitView
		fitViewOptions={{ includeHiddenNodes: false }}
		nodesDraggable={false}
		nodesConnectable={false}
	>
		<Controls showLock={false} />
		<Background variant={BackgroundVariant.Dots} />
	</SvelteFlow>
</div>
