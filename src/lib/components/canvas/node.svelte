<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge } from '../ui/badge';

	type $$Props = NodeProps;
	export let data: $$Props['data'];
</script>

<div class="rounded-lg shadow-lg transition-all hover:shadow-xl">
	{#if !data.isRoot}
		<Handle type="target" position={Position.Top} class="!h-3 !w-3 !border-2 !bg-primary" />
	{/if}
	<div class="w-[280px] overflow-hidden rounded-lg border-2 border-stone-200 bg-white">
		<div class="border-b border-stone-200 bg-stone-50 p-3">
			<div class="flex items-center justify-between gap-2">
				<Badge variant="outline" class="font-mono text-sm">
					{data.code}
				</Badge>
				<Badge variant="secondary" class="text-xs">
					Level {data.level}
				</Badge>
			</div>
			<h3 class="mt-2 line-clamp-2 text-sm font-medium text-stone-800">
				{data.name}
			</h3>
		</div>
		<div class="flex items-center justify-between px-3 py-2 text-sm">
			<span class="text-stone-600">Credits: {data.credits}</span>
		</div>
		{#if data.restrictions.length > 0}
			<div class="flex items-center justify-between px-3 py-2 text-sm">
				<span class="text-stone-600"
					>Level restrictions: <div class="flex flex-col gap-2">
						{#each data.restrictions as restriction}
							<Badge variant="outline" class="w-max text-xs">
								{restriction.credits}
								credits from level {restriction.level}

								{restriction.area}
							</Badge>
						{/each}
					</div>
				</span>
			</div>
		{/if}
	</div>
	{#if !data.isLeaf}
		<Handle type="source" position={Position.Bottom} class="!h-3 !w-3 !border-2 !bg-primary" />
	{/if}
</div>
