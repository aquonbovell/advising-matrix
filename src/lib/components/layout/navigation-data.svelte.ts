import type { UserRole } from '$lib/db/schema';
import type { ComponentType } from 'svelte';
import { type Icon } from 'lucide-svelte';
import Terminal from 'lucide-svelte/icons/terminal';
import TestTube from 'lucide-svelte/icons/test-tube';
import Book from 'lucide-svelte/icons/book';
import UserPlus from 'lucide-svelte/icons/user-plus';
import Users from 'lucide-svelte/icons/users';
type menuItemsType = Record<UserRole, { label: string; href: string; icon: ComponentType<Icon> }[]>;

const UserMenuItems: menuItemsType = {
	STUDENT: [
		{ label: 'Matrix', href: '/student/matrix', icon: Terminal },
		{ label: 'Courses', href: '/student/courses', icon: Book },
		{ label: 'Advisor', href: '/student/advisor', icon: Users }
	],
	ADVISOR: [
		{ label: 'Invite Student', href: '/advisor/invite', icon: UserPlus },
		{ label: 'My Students', href: '/advisor/advising-students', icon: Users },
		{ label: 'All Students', href: '/advisor/students', icon: Users },
		{ label: 'Courses', href: '/advisor/courses', icon: Book }
	],
	ADMIN: [
		{ label: 'Users', href: '/admin/users', icon: Users },
		{ label: 'Courses', href: '/admin/courses', icon: Book },
		{ label: 'Faculties', href: '/admin/faculties', icon: Book },
		{ label: 'Departments', href: '/admin/departments', icon: Book },
		{ label: 'Students', href: '/admin/students', icon: Book },
		{ label: 'Majors', href: '/admin/majors', icon: Book },
		{ label: 'Minors', href: '/admin/minors', icon: Book }
	]
};
export { UserMenuItems };
