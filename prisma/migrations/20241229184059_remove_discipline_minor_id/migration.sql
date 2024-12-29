/*
  Warnings:

  - You are about to drop the column `minorId` on the `requirement` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_requirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "credits" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "level" TEXT NOT NULL
);
INSERT INTO "new_requirement" ("credits", "details", "id", "level", "option", "type") SELECT "credits", "details", "id", "level", "option", "type" FROM "requirement";
DROP TABLE "requirement";
ALTER TABLE "new_requirement" RENAME TO "requirement";
CREATE UNIQUE INDEX "requirement_id_key" ON "requirement"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
