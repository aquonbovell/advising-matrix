/*
  Warnings:

  - The primary key for the `majorRequirement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `credits` on the `majorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `majorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `majorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `majorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `option` on the `majorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `majorRequirement` table. All the data in the column will be lost.
  - The primary key for the `minorRequirement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `credits` on the `minorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `minorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `minorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `minorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `option` on the `minorRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `minorRequirement` table. All the data in the column will be lost.
  - Added the required column `requirementId` to the `majorRequirement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requirementId` to the `minorRequirement` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "requirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minorId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "level" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_majorRequirement" (
    "majorId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,

    PRIMARY KEY ("majorId", "requirementId"),
    CONSTRAINT "majorRequirement_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "major" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "majorRequirement_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirement" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
INSERT INTO "new_majorRequirement" ("majorId") SELECT "majorId" FROM "majorRequirement";
DROP TABLE "majorRequirement";
ALTER TABLE "new_majorRequirement" RENAME TO "majorRequirement";
CREATE UNIQUE INDEX "majorRequirement_majorId_requirementId_key" ON "majorRequirement"("majorId", "requirementId");
CREATE TABLE "new_minorRequirement" (
    "minorId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,

    PRIMARY KEY ("minorId", "requirementId"),
    CONSTRAINT "minorRequirement_minorId_fkey" FOREIGN KEY ("minorId") REFERENCES "minor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "minorRequirement_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirement" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
INSERT INTO "new_minorRequirement" ("minorId") SELECT "minorId" FROM "minorRequirement";
DROP TABLE "minorRequirement";
ALTER TABLE "new_minorRequirement" RENAME TO "minorRequirement";
CREATE UNIQUE INDEX "minorRequirement_minorId_requirementId_key" ON "minorRequirement"("minorId", "requirementId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "requirement_id_key" ON "requirement"("id");
