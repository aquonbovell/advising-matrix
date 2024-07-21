<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { slide } from 'svelte/transition';
	import { page } from '$app/stores';
	import uwiBanner from '$lib/assets/img/uwi_banner.png';
	import HomeIcon from './icons/HomeIcon.svelte';
	import SettingsIcon from './icons/SettingsIcon.svelte';
	import LogoutIcon from './icons/LogoutIcon.svelte';
	import MenuIcon from './icons/MenuIcon.svelte';
	import ChevronIcon from './icons/ChevronIcon.svelte';

	export let user: { name: string; role: string };

	const sidebarOpen = writable(false);
	const userMenuOpen = writable(false);

	const menuItems = [
		{ icon: HomeIcon, label: 'Home', href: '/' },
		{ icon: SettingsIcon, label: 'Advisor', href: 'student/advisor' },


		// Add more menu items here
	];

	$: activeItem = $page.url.pathname;

	let isMobile: boolean;

	function handleResize() {
		isMobile = window.innerWidth < 768;
		sidebarOpen.set(!isMobile);
	}

	function toggleSidebar() {
		sidebarOpen.update((n) => !n);
	}

	function toggleUserMenu(event: MouseEvent) {
		event.stopPropagation();
		userMenuOpen.update((n) => !n);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
			sidebarOpen.set(false);
		}
		if (!target.closest('.user-menu')) {
			userMenuOpen.set(false);
		}
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<svelte:window on:click={handleClickOutside} />

{#if isMobile}
	<button
		class="sidebar-toggle fixed left-4 top-4 z-40 block rounded-md text-gray-500 transition-colors duration-200 hover:text-gray-600 focus:outline-none md:hidden"
		on:click={toggleSidebar}
		aria-label={$sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
	>
		<MenuIcon class="h-6 w-6" />
	</button>
{/if}

<aside
	class="sidebar fixed inset-y-0 left-0 z-50 h-screen w-64 transform border-r border-gray-200 bg-white shadow-lg transition-all duration-300 ease-in-out
	{$sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0"
	aria-label="Sidebar"
>
	<div class="flex h-full flex-col">
		<header class="border-b border-gray-200 p-4">
			<img src={uwiBanner} alt="UWI Banner" class="h-12 w-auto object-contain" />
		</header>

		<nav class="flex-grow space-y-1 overflow-y-auto p-4">
			{#each menuItems as item}
				<a
					href={item.href}
					class="flex items-center rounded-lg px-4 py-2 transition-colors duration-200
									{activeItem === item.href ? 'bg-gray-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}"
				>
					<svelte:component this={item.icon} class="mr-3 h-6 w-6" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<div class="user-menu relative border-t border-gray-200 p-4">
			<button class="flex w-full items-center justify-between" on:click={toggleUserMenu}>
				<div class="flex items-center">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"
					>
						<!-- Uncomment the following line to display the first letter of the user's name as the avatar when database is updated to handle name -->
						<!-- <span class="text-lg font-semibold">{user.name[0]}</span> -->
						<span class="text-lg font-semibold">J</span>
					</div>
					<div class="ml-3">
						<!-- Uncomment the following line to display the first letter of the user's name as the avatar when database is updated to handle name -->
						<!-- <p class="text-sm font-medium text-gray-700">{user.name}</p> -->
						<p class="text-sm font-medium text-gray-700">John Doe</p>
						<p class="text-xs text-gray-500">{user.role}</p>
					</div>
				</div>

				<ChevronIcon
					class="text-gray-400 transition-transform duration-200 {$userMenuOpen
						? 'rotate-180'
						: ''}"
				/>
			</button>

			{#if $userMenuOpen}
				<div
					transition:slide={{ duration: 200 }}
					class="absolute bottom-full left-0 right-0 z-10 mb-1 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
				>
					<a
						href="/settings"
						class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
					>
						<SettingsIcon class="mr-3 h-5 w-5 text-gray-400" />
						Settings
					</a>
					<form method="POST" action="/logout" class="w-full">
						<button
							type="submit"
							class="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
						>
							<LogoutIcon class="mr-3 h-5 w-5 text-gray-400" />
							Logout
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</aside>
