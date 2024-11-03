<script lang="ts">
	import type { PageData } from './$types';
	import CreateForm from './create-form.svelte';

	export let data: PageData;
</script>

<div class="mx-auto max-w-2xl">
	<h1 class="font-bold">Create user</h1>
	<CreateForm data={data.form} />
</div>
