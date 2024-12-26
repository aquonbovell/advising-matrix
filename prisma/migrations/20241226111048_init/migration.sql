-- CreateTable
CREATE TABLE
    "email_verification_request" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" BIGINT NOT NULL,
        "email" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        CONSTRAINT "email_verification_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );

-- CreateTable
CREATE TABLE
    "password_reset_session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" BIGINT NOT NULL,
        "email" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "emailVerified" BOOLEAN NOT NULL,
        "twoFactorVerified" BOOLEAN NOT NULL,
        CONSTRAINT "password_reset_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );

-- CreateTable
CREATE TABLE
    "session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" BIGINT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "twoFactorVerified" BOOLEAN NOT NULL,
        CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    );

-- CreateTable
CREATE TABLE
    "user" (
        "id" BIGINT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "username" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "emailVerified" BOOLEAN NOT NULL,
        "totpKey" BLOB,
        "recoveryCode" BLOB NOT NULL
    );

-- CreateIndex
CREATE INDEX "email_index" ON "user" ("email");