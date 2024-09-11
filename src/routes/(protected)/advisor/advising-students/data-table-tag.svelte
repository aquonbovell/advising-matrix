<script lang="ts">
	import { formatTime } from '$lib/utils';
	import * as Popover from '$lib/components/ui/popover';

	export let invite_token: string | null;
	export let invite_expires: Date | null;
</script>

{#if invite_token}
	{#if invite_expires && new Date(invite_expires) > new Date()}
		<Popover.Root>
			<Popover.Trigger
				class="inline-flex min-w-max rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800"
				>Invited</Popover.Trigger
			>
			<Popover.Content class="w-fit text-sm">{formatTime(invite_expires)}</Popover.Content>
		</Popover.Root>
	{:else}
		<Popover.Root>
			<Popover.Trigger
				class="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800"
				>Expired</Popover.Trigger
			>
		</Popover.Root>
	{/if}
{:else}
	<Popover.Root>
		<Popover.Trigger
			class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800"
			>Active</Popover.Trigger
		>
	</Popover.Root>
{/if}
