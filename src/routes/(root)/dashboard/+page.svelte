<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

Dashboard page: {data}

<form action="/logout" method="post"><button type="submit">logout</button></form>
