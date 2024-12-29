<script lang="ts">
	import TwofaSetupForm from '$lib/components/twofa-setup-form.svelte';

	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<pre>{JSON.stringify(form, null, 2)}</pre>

<div class="flex h-screen w-full items-center justify-center px-4">
	<TwofaSetupForm data={data.form} qrcode={data.qrcode} />
</div>
