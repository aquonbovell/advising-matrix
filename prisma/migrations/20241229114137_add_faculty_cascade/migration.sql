-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);
INSERT INTO "new_department" ("facultyId", "id", "name") SELECT "facultyId", "id", "name" FROM "department";
DROP TABLE "department";
ALTER TABLE "new_department" RENAME TO "department";
CREATE UNIQUE INDEX "department_id_key" ON "department"("id");
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
