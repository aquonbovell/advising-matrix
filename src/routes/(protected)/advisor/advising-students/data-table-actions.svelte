<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/stores';
	import { notifications } from '$lib/stores/notifications';
	import { selectedStudent } from '$lib/stores/advisor';
	import { getToastState } from '$lib/components/toast/toast-state.svelte';

	const toastState = getToastState();

	export let code: string;
	export let token: string | null;
	export let expires: Date | null;
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
				Copy Student Code
			</DropdownMenu.Item>
			{#if token}
				<DropdownMenu.Item
					on:click={() => {
						if (token === null) return '';
						if (typeof window === 'undefined') return '';
						navigator.clipboard.writeText(`${window.location.origin}/register?token=${token}`);
					}}>Copy Student Token</DropdownMenu.Item
				>
			{/if}
			{#if token}
				<DropdownMenu.Item
					on:click={async () => {
						if (token === null) return '';
						if (typeof window === 'undefined') return '';
						navigator.clipboard.writeText(`${window.location.origin}/register?token=${token}`);

						const form = new FormData();

						form.append('token', token);

						const res = await fetch('/api/senduseremail', {
							method: 'POST',
							body: form
						});

						const data = await res.json();

						if (data.status === 200) {
							toastState.add('Notice', 'Invitation sent successfully!', 'success');
						} else {
							toastState.add('Notice', data.message, 'error');
						}
					}}>Send Invite</DropdownMenu.Item
				>
			{/if}
			{#if expires && new Date(expires) < new Date()}
				<DropdownMenu.Item
					on:click={async () => {
						const response = await fetch(`/api/student/${code}/reset-token`, {
							method: 'POST'
						});

						const data = await response.json();

						if (data.success) {
							window.location.reload();
							notifications.info('Token reset', 5000);
						} else {
							notifications.info('Failed to reset token', 5000);
						}
					}}>Reset Token</DropdownMenu.Item
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
			on:click={() => {
				selectedStudent.set(code);
			}}>View Student Overview</DropdownMenu.Item
		>
		<DropdownMenu.Item href={'/advisor/advising-students' + '/' + code + '/matrix'}
			>View Student Degree</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
