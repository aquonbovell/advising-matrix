<script lang="ts">
	import UserForm from './user-form.svelte';

	export let data;
</script>

<div class="mx-auto max-w-fit">
	<h1 class="mb-4 text-2xl font-bold">Invite Student</h1>

	<UserForm data={data.form} majors={data.majors} minors={data.minors} />
</div>
