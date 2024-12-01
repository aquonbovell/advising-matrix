<script lang="ts" module>
	import Building from 'lucide-svelte/icons/building';
	import BookType from 'lucide-svelte/icons/book-type';
	import SquareTerminal from 'lucide-svelte/icons/users';

	const data = {
		user: {
			name: 'Shad',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		navMain: [
			{
				title: 'Users',
				url: '/users',
				icon: SquareTerminal,
				isActive: true,
				items: [
					{
						title: 'Advisors',
						url: '#'
					},
					{
						title: 'Students',
						url: '/students'
					}
				]
			}
		],
		disciplines: [
			{
				title: 'Disciplines',
				url: '#',
				icon: BookType,
				isActive: false,
				items: [
					{
						title: 'Majors',
						url: '/majors'
					},
					{
						title: 'Minors',
						url: '/minors'
					},
					{
						title: 'Courses',
						url: '/courses'
					}
				]
			}
		],
		faculties: [
			{
				title: 'Faculties',
				url: '/faculties',
				icon: Building,
				isActive: false,
				items: [
					{
						title: 'Faculties',
						url: '/faculties'
					},
					{
						title: 'Departments',
						url: '/departments'
					}
				]
			}
		]
	};
</script>

<script lang="ts">
	import NavMain from '$lib/components/nav-main.svelte';
	import NavUser from '$lib/components/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Command from 'lucide-svelte/icons/command';
	import type { ComponentProps } from 'svelte';
	import NavDisciplines from './nav-disciplines.svelte';
	import NavFaculties from '$lib/components/nav-faculties.svelte';
	import { page } from '$app/stores';

	const user = {
		name: $page.data.user.name,
		email: $page.data.user.email
	};

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<Command class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">UWI Cavehill</span>
								<span class="truncate text-xs">Science & Technology</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavFaculties items={data.faculties} />
		<NavDisciplines items={data.disciplines} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
