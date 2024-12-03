<script lang="ts" module>
	import Building from 'lucide-svelte/icons/building';
	import BookType from 'lucide-svelte/icons/book-type';
	import Users from 'lucide-svelte/icons/users';

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
				icon: Users,
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
				url: '/majors',
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
		],
		students: [
			{
				title: 'Students',
				url: '/advising',
				icon: Users,
				items: [
					{
						title: 'Advising',
						url: '/advising'
					},
					{
						title: 'Search',
						url: '/students'
					}
				]
			}
		],
		student: {
			menu: [
				{
					name: 'My Degree',
					url: '/matrix',
					icon: BookType
				},
				{
					name: 'My Advisor',
					url: '/advisor',
					icon: Users
				}
			],
			items: [
				{
					title: 'Explore',
					url: '/explore',
					icon: BookType,
					items: [
						{
							title: 'Checklist',
							url: '/explore'
						},
						{
							title: 'Courses',
							url: '/courses'
						},
						{
							title: 'What If',
							url: '/what-if'
						}
					]
				}
			]
		}
	};
</script>

<script lang="ts">
	import NavMain from '$lib/components/nav-main.svelte';
	import NavMainStudent from '$lib/components/nav-main.student.svelte';
	import NavUser from '$lib/components/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import NavDisciplines from './nav-disciplines.svelte';
	import NavFaculties from '$lib/components/nav-faculties.svelte';
	import { page } from '$app/stores';
	import NavStudents from '$lib/components/nav-students.svelte';
	import NavStudent from '$lib/components/nav-student.svelte';

	const user = {
		name: $page.data.user.name,
		email: $page.data.user.email,
		role: $page.data.user.role
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
								<img src="/logo.jpg" alt="Shad" class="rounded-lg" />
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
		{#if user.role === 'ADMIN'}
			<NavMain items={data.navMain} />
			<NavFaculties items={data.faculties} />
			<NavDisciplines items={data.disciplines} />
		{/if}
		{#if user.role === 'ADVISOR'}
			<NavStudents items={data.students} />
		{/if}
		{#if user.role === 'STUDENT'}
			<NavStudent items={data.student.menu} />
			<NavMainStudent items={data.student.items} />
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
</Sidebar.Root>
