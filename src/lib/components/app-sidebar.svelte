<script lang="ts" module>
	import BookOpen from 'lucide-svelte/icons/book-open';
	import Bot from 'lucide-svelte/icons/bot';
	import ChartPie from 'lucide-svelte/icons/chart-pie';
	import Frame from 'lucide-svelte/icons/frame';
	import Map from 'lucide-svelte/icons/map';
	import Settings2 from 'lucide-svelte/icons/settings-2';
	import SquareTerminal from 'lucide-svelte/icons/square-terminal';

	// This is sample data.
	const data = {
		user: {
			name: 'Anakin Skywalker',
			email: 'email.example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		identity: [
			{
				title: 'Users',
				url: '/users',
				icon: SquareTerminal,
				isActive: true,
				items: [
					{
						title: 'Advisors',
						url: '/users/advisors'
					},
					{
						title: 'Students',
						url: '/users/students'
					}
				]
			}
		],
		courses: [
			{
				name: 'Facilities',
				url: '/courses/facilities',
				icon: Frame
			},
			{
				name: 'Departments',
				url: '/courses/departments',
				icon: ChartPie
			},
			{
				name: 'Courses',
				url: '/courses',
				icon: Map
			}
		],
		extras: [
			{
				title: 'Models',
				url: '#',
				icon: Bot,
				items: [
					{
						title: 'Genesis',
						url: '#'
					},
					{
						title: 'Explorer',
						url: '#'
					},
					{
						title: 'Quantum',
						url: '#'
					}
				]
			},
			{
				title: 'Documentation',
				url: '#',
				icon: BookOpen,
				items: [
					{
						title: 'Introduction',
						url: '#'
					},
					{
						title: 'Get Started',
						url: '#'
					},
					{
						title: 'Tutorials',
						url: '#'
					},
					{
						title: 'Changelog',
						url: '#'
					}
				]
			},
			{
				title: 'Settings',
				url: '#',
				icon: Settings2,
				items: [
					{
						title: 'General',
						url: '#'
					},
					{
						title: 'Team',
						url: '#'
					},
					{
						title: 'Billing',
						url: '#'
					},
					{
						title: 'Limits',
						url: '#'
					}
				]
			}
		]
	};
</script>

<script lang="ts">
	import NavIdentity from '$lib/components/nav-identity.svelte';
	import NavCourses from '$lib/components/nav-courses.svelte';
	import NavUser from '$lib/components/nav-user.svelte';
	import TeamSwitcher from '$lib/components/team-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { type ComponentProps } from 'svelte';

	let {
		ref = $bindable(null),
		collapsible = 'icon',
		user,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		user: {
			id: string;
			username: string;
			emailVerified: boolean;
			role: 'student' | 'advisor' | 'superadvisor' | 'admin';
			email: string;
			registered2FA: boolean;
		};
	} = $props();
</script>

<Sidebar.Root bind:ref {collapsible} {...restProps}>
	<Sidebar.Header>
		<TeamSwitcher />
	</Sidebar.Header>
	<Sidebar.Content>
		{#if user.role === 'admin'}
			<NavIdentity items={data.identity} />
		{/if}
		{#if user.role === 'admin'}
			<NavCourses projects={data.courses} />
		{/if}
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser {user} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
