<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';

	export let code: string;

	export let existing: boolean;

</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<Ellipsis class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Item disabled={existing}>
				<form action="" method="post">
					<label for="student_code" aria-hidden="true" hidden>Student Code</label>
					<input type="hidden" name="student_code" value={code} />
					<button type="submit">Add to my list</button>
				</form></DropdownMenu.Item
			>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item href={'/advisor/students/' + code + '/'}>View student</DropdownMenu.Item>
		<DropdownMenu.Item href={'/advisor/students/' + code + '/degree-tracker'}
			>View student degree</DropdownMenu.Item
		>
	</DropdownMenu.Content>
</DropdownMenu.Root>
