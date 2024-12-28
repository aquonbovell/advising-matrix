/*
Warnings:

- Added the required column `role` to the `user` table without a default value. This is not possible if the table is not empty.

 */
-- RedefineTables
PRAGMA defer_foreign_keys = ON;

PRAGMA foreign_keys = OFF;

CREATE TABLE
  "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "totpKey" BLOB,
    "recoveryCode" BLOB NOT NULL
  );

INSERT INTO
  "new_user" (
    "email",
    "emailVerified",
    "id",
    "role",
    "passwordHash",
    "recoveryCode",
    "totpKey",
    "username"
  )
SELECT
  "email",
  "emailVerified",
  "id",
  'student' AS "role",
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