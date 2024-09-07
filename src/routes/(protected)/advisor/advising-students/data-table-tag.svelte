<script lang="ts">
	import { formatTime } from '$lib/utils';

	export let invite_token: string | null;
	export let invite_expires: Date | null;
</script>

{#if invite_token}
	{#if invite_expires && new Date(invite_expires) > new Date()}
		<span
			class="inline-flex min-w-max rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800"
		>
			Invitation expires in <br />{formatTime(invite_expires)}
		</span>
	{:else}
		<span
			class="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800"
		>
			Invitation expired
		</span>
	{/if}
{:else}
	<span
		class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
	>
		Active
	</span>
{/if}
