<script lang="ts">
	import TwofaSetupForm from '$lib/components/twofa-setup-form.svelte';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<TwofaSetupForm data={data.form} qrcode={data.qrcode} />
</div>
