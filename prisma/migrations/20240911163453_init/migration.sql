-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alternate_email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advisor" (
    "advisor_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,

    CONSTRAINT "Advisor_pkey" PRIMARY KEY ("advisor_id","student_id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "major_id" UUID NOT NULL,
    "minor_id" UUID NOT NULL,
    "invite_token" TEXT,
    "invite_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "departmentId" BIGINT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoursePrerequisite" (
    "id" UUID NOT NULL,
    "courseId" INTEGER NOT NULL,
    "prerequisiteId" INTEGER NOT NULL,

    CONSTRAINT "CoursePrerequisite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Majors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Minors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Minors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MajorRequirements" (
    "id" UUID NOT NULL,
    "majorId" UUID NOT NULL,
    "type" "RequirementType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "MajorRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinorRequirements" (
    "id" UUID NOT NULL,
    "minorId" UUID NOT NULL,
    "type" "RequirementType" NOT NULL,
    "credits" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "MinorRequirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentCourses" (
    "id" UUID NOT NULL,
    "grade" TEXT NOT NULL,
    "requirementId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "StudentCourses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_minor_id_key" ON "Student"("minor_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_id_key" ON "Course"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CoursePrerequisite_id_key" ON "CoursePrerequisite"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Majors_id_key" ON "Majors"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Majors_name_idx" ON "Majors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Minors_id_key" ON "Minors"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Minors_name_idx" ON "Minors"("name");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_minor_id_fkey" FOREIGN KEY ("minor_id") REFERENCES "Minors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "Majors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CoursePrerequisite" ADD CONSTRAINT "CoursePrerequisite_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MajorRequirements" ADD CONSTRAINT "MajorRequirements_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Majors"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "MinorRequirements" ADD CONSTRAINT "MinorRequirements_minorId_fkey" FOREIGN KEY ("minorId") REFERENCES "Minors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StudentCourses" ADD CONSTRAINT "StudentCourses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StudentCourses" ADD CONSTRAINT "StudentCourses_majorRequirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "MajorRequirements"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StudentCourses" ADD CONSTRAINT "StudentCourses_minorRequirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "MinorRequirements"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StudentCourses" ADD CONSTRAINT "StudentCourses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
