/*
Warnings:

- The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.

 */
-- RedefineTables
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE
    "new_email_verification_request" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        CONSTRAINT "email_verification_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );

INSERT INTO
    "new_email_verification_request" ("code", "email", "expiresAt", "id", "userId")
SELECT
    "code",
    "email",
    "expiresAt",
    "id",
    "userId"
FROM
    "email_verification_request";

DROP TABLE "email_verification_request";

ALTER TABLE "new_email_verification_request"
RENAME TO "email_verification_request";

CREATE TABLE
    "new_password_reset_session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "emailVerified" BOOLEAN NOT NULL,
        "twoFactorVerified" BOOLEAN NOT NULL,
        CONSTRAINT "password_reset_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );

INSERT INTO
    "new_password_reset_session" (
        "code",
        "email",
        "emailVerified",
        "expiresAt",
        "id",
        "twoFactorVerified",
        "userId"
    )
SELECT
    "code",
    "email",
    "emailVerified",
    "expiresAt",
    "id",
    "twoFactorVerified",
    "userId"
FROM
    "password_reset_session";

DROP TABLE "password_reset_session";

ALTER TABLE "new_password_reset_session"
RENAME TO "password_reset_session";

CREATE TABLE
    "new_session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "twoFactorVerified" BOOLEAN NOT NULL,
        CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );

INSERT INTO
    "new_session" ("expiresAt", "id", "twoFactorVerified", "userId")
SELECT
    "expiresAt",
    "id",
    "twoFactorVerified",
    "userId"
FROM
    "session";

DROP TABLE "session";

ALTER TABLE "new_session"
RENAME TO "session";

CREATE TABLE
    "new_user" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "username" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "emailVerified" BOOLEAN NOT NULL,
        "totpKey" BLOB,
        "recoveryCode" BLOB NOT NULL
    );

INSERT INTO
    "new_user" (
        "email",
        "emailVerified",
        "id",
        "passwordHash",
        "recoveryCode",
        "totpKey",
        "username"
    )
SELECT
    "email",
    "emailVerified",
    "id",
    "passwordHash",
    "recoveryCode",
    "totpKey",
    "username"
FROM
    "user";

DROP TABLE "user";

ALTER TABLE "new_user"
RENAME TO "user";

CREATE INDEX "email_index" ON "user" ("email");

PRAGMA foreign_keys = ON;

PRAGMA defer_foreign_keys = OFF;