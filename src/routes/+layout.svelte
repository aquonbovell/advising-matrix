<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="main">
	<div class="gradient"></div>
</div>
<div class="z-10 h-dvh">
	{@render children()}
</div>
