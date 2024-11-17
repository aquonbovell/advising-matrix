export const UserRole = {
	STUDENT: 'STUDENT',
	ADVISOR: 'ADVISOR',
	ADMIN: 'ADMIN'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
