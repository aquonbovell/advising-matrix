<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { get } from 'svelte/store';

	export let code: string;
	export let modalHandler: (e: MouseEvent) => void;
	export let token: { value: string | null; expires: Date | null };
	export let exists: boolean;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content overlap={false}>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item on:click={() => navigator.clipboard.writeText(code)}>
				Copy student code
			</DropdownMenu.Item>
			{#if token.value}
				<DropdownMenu.Item
					on:click={() => {
						if (token.value === null) return '';
						if (typeof window === 'undefined') return '';
						navigator.clipboard.writeText(
							`${window.location.origin}/register?token=${token.value}`
						);
					}}>Copy student token</DropdownMenu.Item
				>
			{/if}
			{#if token.expires && new Date(token.expires) < new Date()}
				<DropdownMenu.Item
					on:click={async () => {
						const response = await fetch(`/api/student/${code}/reset-token`, {
							method: 'POST'
						});

						const data = await response.json();

						if (data.success) {
							window.location.reload();
						}
					}}>Copy Reset Token</DropdownMenu.Item
				>
			{/if}
			{#if !$page.route.id?.includes('advising-students')}
				<DropdownMenu.Item disabled={exists}>
					<form action="" method="post">
						<label for="student_code" aria-hidden="true" hidden>Student Code</label>
						<input type="hidden" name="student_code" value={code} />
						<button type="submit">Add to my list</button>
					</form></DropdownMenu.Item
				>
			{/if}
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href={'/advisor/advising-students' + '/' + code + '/'}
			>View Student</DropdownMenu.Item
		>
		<DropdownMenu.Item
			><a
				href={'/advisor/advising-students' + '/' + code + '/overview'}
				on:click|preventDefault={modalHandler}
				>View Student Overview
			</a></DropdownMenu.Item
		>
		<DropdownMenu.Item href={'/advisor/advising-students' + '/' + code + '/matrix'}
			>View Student Degree</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
