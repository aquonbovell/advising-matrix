<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { Separator } from '$lib/components/ui/separator';
	import { page } from '$app/stores';

	let { children }: { data: LayoutData; children: Snippet } = $props();

	const breadcrumbs = $page.route.id
		?.split('/')
		.slice(1)
		.map((_, i, a) => a.slice(0, i + 1).join('/'));
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<Toaster />
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1 bg-sidebar hover:bg-sidebar-accent" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="/">Home</Breadcrumb.Link>
						</Breadcrumb.Item>
						<!-- <Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
						</Breadcrumb.Item> -->
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<main class="h-full px-4">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
