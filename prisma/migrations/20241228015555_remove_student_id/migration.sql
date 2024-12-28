/*
  Warnings:

  - You are about to drop the column `studentId` on the `advisor` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_advisor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_advisor" ("id", "userId") SELECT "id", "userId" FROM "advisor";
DROP TABLE "advisor";
ALTER TABLE "new_advisor" RENAME TO "advisor";
CREATE UNIQUE INDEX "advisor_id_key" ON "advisor"("id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
