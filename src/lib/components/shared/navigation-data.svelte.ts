import type { UserRole } from '$lib/db/schema';
import type { ComponentType } from 'svelte';
import { type Icon } from 'lucide-svelte';
import Terminal from 'lucide-svelte/icons/terminal';
import Library from 'lucide-svelte/icons/library-big';
import Building from 'lucide-svelte/icons/building';
import Building2 from 'lucide-svelte/icons/building-2';
import Book from 'lucide-svelte/icons/book';
import UserPlus from 'lucide-svelte/icons/user-plus';
import Users from 'lucide-svelte/icons/users';
type menuItemsType = Record<UserRole, { label: string; href: string; icon: ComponentType<Icon> }[]>;

const UserMenuItems: menuItemsType = {
	STUDENT: [
		{ label: 'Matrix', href: '/student/matrix', icon: Terminal },
		{ label: 'Advisor', href: '/student/advisor', icon: Users },
		{ label: 'Courses', href: '/student/courses', icon: Book },
		{ label: 'What courses?', href: '/student/coursecheck', icon: Users }
	],
	ADVISOR: [
		{ label: 'My Students', href: '/advisor/advising-students', icon: Users },
		{ label: 'All Students', href: '/advisor/students', icon: Users },
		{ label: 'Courses', href: '/advisor/courses', icon: Library },
		{ label: 'Invite Student', href: '/advisor/invite', icon: UserPlus }
	],
	ADMIN: [
		{ label: 'Users', href: '/admin/users', icon: Users },
		{ label: 'Students', href: '/admin/students', icon: Users },
		{ label: 'Faculties', href: '/admin/faculties', icon: Building },
		{ label: 'Departments', href: '/admin/departments', icon: Building2 },
		{ label: 'Majors', href: '/admin/majors', icon: Book },
		{ label: 'Minors', href: '/admin/minors', icon: Book },
		{ label: 'Courses', href: '/admin/courses', icon: Library }
	]
};
export { UserMenuItems };
