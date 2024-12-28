-- CreateTable
CREATE TABLE "advisor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "studentId" TEXT
);

-- CreateTable
CREATE TABLE "advising" (
    "advisorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    PRIMARY KEY ("advisorId", "studentId"),
    CONSTRAINT "advising_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "advisor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "advising_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "majorId" TEXT,
    "minorId" TEXT,
    CONSTRAINT "student_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "major" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "department_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "major" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "minor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "majorRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "majorId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "majorRequirement_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "major" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "minorRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minorId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "details" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "minorRequirement_minorId_fkey" FOREIGN KEY ("minorId") REFERENCES "minor" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "departmentId" TEXT NOT NULL,
    "prerequisiteCount" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "prerequisiteType" TEXT NOT NULL,
    CONSTRAINT "course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "department" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "prerequisites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    CONSTRAINT "prerequisites_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "prerequisites_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "levelRestriction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    CONSTRAINT "levelRestriction_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "studentCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "studentCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT "studentCourse_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "advisor_id_key" ON "advisor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "advising_advisorId_studentId_key" ON "advising"("advisorId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_id_key" ON "student"("id");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_id_key" ON "faculty"("id");

-- CreateIndex
CREATE UNIQUE INDEX "department_id_key" ON "department"("id");

-- CreateIndex
CREATE UNIQUE INDEX "department_name_key" ON "department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "major_id_key" ON "major"("id");

-- CreateIndex
CREATE UNIQUE INDEX "major_name_key" ON "major"("name");

-- CreateIndex
CREATE UNIQUE INDEX "minor_id_key" ON "minor"("id");

-- CreateIndex
CREATE UNIQUE INDEX "minor_name_key" ON "minor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "majorRequirement_id_key" ON "majorRequirement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "minorRequirement_id_key" ON "minorRequirement"("id");

-- CreateIndex
CREATE UNIQUE INDEX "course_id_key" ON "course"("id");

-- CreateIndex
CREATE UNIQUE INDEX "course_code_key" ON "course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "course_name_key" ON "course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "prerequisites_id_key" ON "prerequisites"("id");

-- CreateIndex
CREATE UNIQUE INDEX "prerequisites_courseId_prerequisiteId_key" ON "prerequisites"("courseId", "prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "levelRestriction_id_key" ON "levelRestriction"("id");

-- CreateIndex
CREATE UNIQUE INDEX "studentCourse_id_key" ON "studentCourse"("id");
