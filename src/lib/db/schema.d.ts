import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const UserRole = {
    STUDENT: "STUDENT",
    ADVISOR: "ADVISOR",
    ADMIN: "ADMIN"
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const RequirementType = {
    CREDITS: "CREDITS",
    POOL: "POOL"
} as const;
export type RequirementType = (typeof RequirementType)[keyof typeof RequirementType];
export type Advisor = {
    advisor_id: string;
    student_id: string;
};
export type Course = {
    id: number;
    code: string;
    name: string;
    level: number;
    credits: number;
    departmentId: string;
};
export type CoursePrerequisite = {
    id: string;
    courseId: number;
    prerequisiteId: number;
};
export type Department = {
    id: Generated<string>;
    name: string;
};
export type MajorRequirements = {
    id: string;
    majorId: string;
    type: RequirementType;
    credits: number;
    details: unknown;
    level: number | null;
};
export type Majors = {
    id: string;
    name: string;
};
export type MinorRequirements = {
    id: string;
    minorId: string;
    type: RequirementType;
    credits: number;
    details: unknown;
    level: number | null;
};
export type Minors = {
    id: string;
    name: string;
};
export type Program = {
    id: string;
    name: string;
};
export type ProgramMinors = {
    id: string;
    minorId: string;
    type: RequirementType;
    credits: number;
    details: unknown;
    level: number | null;
};
export type ProgramRequirement = {
    id: string;
    programId: string;
    type: RequirementType;
    credits: number;
    details: unknown;
    level: number | null;
};
export type Session = {
    id: string;
    expires_at: Timestamp;
    user_id: string;
};
export type Student = {
    id: string;
    user_id: string;
    invite_token: string | null;
    invite_expires: Timestamp | null;
    program_id: string | null;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
};
export type StudentCourse = {
    id: string;
    grade: string;
    requirementId: string | null;
    studentId: string | null;
    courseId: number | null;
};
export type StudentCourses = {
    id: string;
    grade: string;
    requirementId: string | null;
    studentId: string | null;
    courseId: number | null;
};
export type StudentT = {
    id: string;
    user_id: string;
    invite_token: string | null;
    invite_expires: Timestamp | null;
    major_id: string;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
    minor_id: Generated<string>;
};
export type User = {
    id: string;
    name: string | null;
    email: string;
    password: string;
    role: UserRole;
    created_at: Generated<Timestamp>;
    updated_at: Timestamp;
    alternate_email: string | null;
};
export type DB = {
    Advisor: Advisor;
    Course: Course;
    CoursePrerequisite: CoursePrerequisite;
    Department: Department;
    MajorRequirements: MajorRequirements;
    Majors: Majors;
    MinorRequirements: MinorRequirements;
    Minors: Minors;
    Program: Program;
    ProgramMinors: ProgramMinors;
    ProgramRequirement: ProgramRequirement;
    Session: Session;
    Student: Student;
    StudentCourse: StudentCourse;
    StudentCourses: StudentCourses;
    StudentT: StudentT;
    User: User;
};
