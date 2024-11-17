import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Session = {
    id: string;
    userId: string;
    expiresAt: number;
};
export type User = {
    id: string;
    email: string;
    alternateEmail: string;
    name: string;
    username: string;
    passwordHash: string;
    /**
     * @kyselyType('STUDENT' | 'ADVISOR' | 'ADMIN')
     */
    role: 'STUDENT' | 'ADVISOR' | 'ADMIN';
    onboarded: number;
};
export type DB = {
    Session: Session;
    User: User;
};
