import type { UserRole } from '$lib/db/schema';

const specificMenuItems: Record<UserRole, { label: string; href: string }[]> = {
	STUDENT: [
		{ label: 'Matrix', href: '/student/matrix' },
		{ label: 'Test', href: '/student/test' },
		{ label: 'Courses', href: '/student/courses' }
	],
	ADVISOR: [
		{ label: 'Invite Student', href: 'advisor/advising-students/invite' },
		{ label: 'My Students', href: '/advisor/advising-students' },
		{ label: 'All Students', href: '/advisor/students' },
		{ label: 'Courses', href: '/advisor/courses' }
	],
	ADMIN: [
		{ label: 'Users', href: '/admin/users' },
		{ label: 'Admin Courses', href: '/admin/courses' }
	]
};

export { specificMenuItems };
