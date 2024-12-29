/*
  Warnings:

  - You are about to drop the column `comment` on the `course` table. All the data in the column will be lost.
  - Added the required column `description` to the `course` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "departmentId" TEXT NOT NULL,
    "prerequisiteCount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "prerequisiteType" TEXT NOT NULL,
    CONSTRAINT "course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);
INSERT INTO "new_course" ("code", "credits", "departmentId", "id", "level", "name", "prerequisiteCount", "prerequisiteType") SELECT "code", "credits", "departmentId", "id", "level", "name", "prerequisiteCount", "prerequisiteType" FROM "course";
DROP TABLE "course";
ALTER TABLE "new_course" RENAME TO "course";
CREATE UNIQUE INDEX "course_id_key" ON "course"("id");
CREATE UNIQUE INDEX "course_code_key" ON "course"("code");
CREATE UNIQUE INDEX "course_name_key" ON "course"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
