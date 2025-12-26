-- CreateEnum
CREATE TYPE "SpecialEventType" AS ENUM ('YOKLAMA', 'MANAGEMENT', 'SOCIAL_SPORTS', 'CEREMONY', 'ORIENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ConferenceStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_courseId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_entries" DROP CONSTRAINT "schedule_entries_classId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_entries" DROP CONSTRAINT "schedule_entries_courseId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_entries" DROP CONSTRAINT "schedule_entries_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_entries" DROP CONSTRAINT "schedule_entries_termId_fkey";

-- DropForeignKey
ALTER TABLE "schedule_entries" DROP CONSTRAINT "schedule_entries_timeSlotId_fkey";

-- DropIndex
DROP INDEX "attendances_studentId_courseId_date_key";

-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "dailyLessonId" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- Rename existing schedule entries table to keep veriyi koru
ALTER TABLE "schedule_entries" RENAME TO "daily_lessons";

-- Eski kısıt/indeks isimleri schedule_entries olarak kaldı; yeni isimler ve alanlar ekleniyor
ALTER TABLE "daily_lessons"
    ADD COLUMN "isSpecialEvent" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "specialEventType" "SpecialEventType",
    ADD COLUMN "specialEventId" TEXT,
    ADD COLUMN "specialEventTitle" TEXT,
    ADD COLUMN "requiresInstructor" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "conferenceId" TEXT,
    ADD COLUMN "isBlockSchedule" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "blockDuration" INTEGER,
    ADD COLUMN "blockTitle" TEXT,
    ADD COLUMN "blockStartSlot" INTEGER,
    ADD COLUMN "blockEndSlot" INTEGER,
    ADD COLUMN "isPhysicalActivity" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "requiresSpecialArea" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "specialAreaType" TEXT,
    ADD COLUMN "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "cancelReason" TEXT;

-- Eski indeks/kısıt isimlerini yeni isimlere taşı (varsa)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'schedule_entries_pkey') THEN
        ALTER INDEX "schedule_entries_pkey" RENAME TO "daily_lessons_pkey";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'schedule_entries_classId_dayOfWeek_timeSlotId_specificDate_key') THEN
        ALTER INDEX "schedule_entries_classId_dayOfWeek_timeSlotId_specificDate_key" RENAME TO "daily_lessons_classId_dayOfWeek_timeSlotId_specificDate_key";
    END IF;
    IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'schedule_entries_instructorId_dayOfWeek_idx') THEN
        ALTER INDEX "schedule_entries_instructorId_dayOfWeek_idx" RENAME TO "daily_lessons_instructorId_dayOfWeek_idx";
    END IF;
END $$;

-- CreateTable
CREATE TABLE "special_events" (
    "id" TEXT NOT NULL,
    "eventType" "SpecialEventType" NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 1,
    "dayOfWeek" INTEGER,
    "slotIndex" INTEGER,
    "requiresInstructor" BOOLEAN NOT NULL DEFAULT false,
    "allClassesTogether" BOOLEAN NOT NULL DEFAULT false,
    "countsTowardCurriculum" BOOLEAN NOT NULL DEFAULT false,
    "managedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_speakers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT,
    "organization" TEXT,
    "department" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "expertise" JSONB,
    "bio" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conferences" (
    "id" TEXT NOT NULL,
    "conferenceTitle" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "externalSpeakerId" TEXT,
    "scheduledDate" DATE,
    "duration" INTEGER NOT NULL DEFAULT 2,
    "startSlot" INTEGER,
    "endSlot" INTEGER,
    "targetClasses" JSONB,
    "isAllClasses" BOOLEAN NOT NULL DEFAULT false,
    "requiresSpecialRoom" BOOLEAN NOT NULL DEFAULT false,
    "specialRoomType" TEXT,
    "requiredEquipment" JSONB,
    "countsTowardCurriculum" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT,
    "status" "ConferenceStatus" NOT NULL DEFAULT 'PLANNED',
    "organizerId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conferences_pkey" PRIMARY KEY ("id")
);

-- Günlük ders indeksleri: mevcutsa düşür, sonra oluştur
DROP INDEX IF EXISTS "daily_lessons_instructorId_dayOfWeek_idx";
DROP INDEX IF EXISTS "daily_lessons_specialEventId_idx";
DROP INDEX IF EXISTS "daily_lessons_specialEventType_idx";
DROP INDEX IF EXISTS "daily_lessons_isSpecialEvent_idx";
DROP INDEX IF EXISTS "daily_lessons_isBlockSchedule_idx";
DROP INDEX IF EXISTS "daily_lessons_conferenceId_idx";
DROP INDEX IF EXISTS "daily_lessons_classId_dayOfWeek_timeSlotId_specificDate_key";

-- CreateIndex
CREATE INDEX "daily_lessons_instructorId_dayOfWeek_idx" ON "daily_lessons"("instructorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "daily_lessons_specialEventId_idx" ON "daily_lessons"("specialEventId");

-- CreateIndex
CREATE INDEX "daily_lessons_specialEventType_idx" ON "daily_lessons"("specialEventType");

-- CreateIndex
CREATE INDEX "daily_lessons_isSpecialEvent_idx" ON "daily_lessons"("isSpecialEvent");

-- CreateIndex
CREATE INDEX "daily_lessons_isBlockSchedule_idx" ON "daily_lessons"("isBlockSchedule");

-- CreateIndex
CREATE INDEX "daily_lessons_conferenceId_idx" ON "daily_lessons"("conferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_lessons_classId_dayOfWeek_timeSlotId_specificDate_key" ON "daily_lessons"("classId", "dayOfWeek", "timeSlotId", "specificDate");

-- CreateIndex
CREATE INDEX "special_events_eventType_idx" ON "special_events"("eventType");

-- CreateIndex
CREATE INDEX "special_events_dayOfWeek_slotIndex_idx" ON "special_events"("dayOfWeek", "slotIndex");

-- CreateIndex
CREATE UNIQUE INDEX "external_speakers_email_key" ON "external_speakers"("email");

-- CreateIndex
CREATE INDEX "external_speakers_lastName_firstName_idx" ON "external_speakers"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "external_speakers_organization_idx" ON "external_speakers"("organization");

-- CreateIndex
CREATE INDEX "external_speakers_isActive_idx" ON "external_speakers"("isActive");

-- CreateIndex
CREATE INDEX "conferences_scheduledDate_idx" ON "conferences"("scheduledDate");

-- CreateIndex
CREATE INDEX "conferences_status_idx" ON "conferences"("status");

-- CreateIndex
CREATE INDEX "conferences_externalSpeakerId_idx" ON "conferences"("externalSpeakerId");

-- CreateIndex
CREATE INDEX "conferences_courseId_idx" ON "conferences"("courseId");

-- CreateIndex
CREATE INDEX "attendances_dailyLessonId_idx" ON "attendances"("dailyLessonId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_date_classId_dailyLessonId_key" ON "attendances"("studentId", "date", "classId", "dailyLessonId");

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_termId_fkey" FOREIGN KEY ("termId") REFERENCES "terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_specialEventId_fkey" FOREIGN KEY ("specialEventId") REFERENCES "special_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_lessons" ADD CONSTRAINT "daily_lessons_conferenceId_fkey" FOREIGN KEY ("conferenceId") REFERENCES "conferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_externalSpeakerId_fkey" FOREIGN KEY ("externalSpeakerId") REFERENCES "external_speakers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conferences" ADD CONSTRAINT "conferences_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES "daily_lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;


