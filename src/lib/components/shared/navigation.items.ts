import type { UserRole } from '$lib/types';

type menuItemsType = Record<UserRole, { label: string; href: string; icon: string }[]>;

const UserMenuItems: menuItemsType = {
	STUDENT: [
		{ label: 'Matrix', href: '/matrix', icon: 'mdi:map-marker-path' },
		{ label: 'Advisor', href: '/advisor', icon: 'hugeicons:mentoring' },
		{ label: 'Courses', href: '/courses', icon: 'hugeicons:course' },
		{ label: 'What courses?', href: '/coursecheck', icon: 'carbon:course' }
	],
	ADVISOR: [
		{ label: 'My Students', href: '/advising-students', icon: 'mdi:users' },
		{ label: 'All Students', href: '/students', icon: 'tabler:users-group' },
		{ label: 'Courses', href: '/courses', icon: 'hugeicons:course' },
		{ label: 'Invite Student', href: '/invite', icon: 'tabler:users-plus' }
	],
	ADMIN: [
		{ label: 'Users', href: '/users', icon: 'fa6-solid:users-line' },
		{ label: 'Students', href: '/students', icon: 'ci:users-group' },
		{ label: 'Faculties', href: '/faculties', icon: 'mingcute:building-2-fill' },
		{ label: 'Departments', href: '/departments', icon: 'icon-park-outline:building-four' },
		{ label: 'Majors', href: '/majors', icon: 'mdi:cast-education' },
		{ label: 'Minors', href: '/minors', icon: 'mdi:cast-education' },
		{ label: 'Courses', href: '/courses', icon: 'hugeicons:course' }
	]
};
export { UserMenuItems };
