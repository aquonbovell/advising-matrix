<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import StudentPage from '../../../../student/matrix/+page.svelte';
</script>

<StudentPage {data} />
