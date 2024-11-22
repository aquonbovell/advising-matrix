<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { value }: { value: string } = $props();
</script>

<Badge>{value}</Badge>
