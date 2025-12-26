--
-- PostgreSQL database dump
--

\restrict 5oCeJya1cDOGZurfEfLfzPaeXUuMSAMDs8Y0tdfGvzUgJluF67Bd5OCEwU0Rns1

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'PERMITTED',
    'MEDICAL_REPORT',
    'HOSPITALIZED',
    'DORM_REST'
);


ALTER TYPE public."AttendanceStatus" OWNER TO postgres;

--
-- Name: ConferenceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ConferenceStatus" AS ENUM (
    'PLANNED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."ConferenceStatus" OWNER TO postgres;

--
-- Name: CourseType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CourseType" AS ENUM (
    'STANDARD',
    'CONFERENCE',
    'PANEL'
);


ALTER TYPE public."CourseType" OWNER TO postgres;

--
-- Name: DayOfWeek; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DayOfWeek" AS ENUM (
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY'
);


ALTER TYPE public."DayOfWeek" OWNER TO postgres;

--
-- Name: DisciplinaryPenaltyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisciplinaryPenaltyType" AS ENUM (
    'WARNING',
    'REPRIMAND',
    'POINT_DEDUCTION',
    'EXTRA_DUTY'
);


ALTER TYPE public."DisciplinaryPenaltyType" OWNER TO postgres;

--
-- Name: DisciplinaryProcessStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DisciplinaryProcessStatus" AS ENUM (
    'INCIDENT_REPORTED',
    'DEFENSE_REQUESTED',
    'DEFENSE_RECEIVED',
    'BOARD_REVIEW',
    'DECIDED',
    'CLOSED'
);


ALTER TYPE public."DisciplinaryProcessStatus" OWNER TO postgres;

--
-- Name: DutySource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DutySource" AS ENUM (
    'REGULAR',
    'DISCIPLINARY',
    'SWAP'
);


ALTER TYPE public."DutySource" OWNER TO postgres;

--
-- Name: DutyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DutyType" AS ENUM (
    'MORNING',
    'NOON',
    'EVENING',
    'NIGHT',
    'OFFICER'
);


ALTER TYPE public."DutyType" OWNER TO postgres;

--
-- Name: DynamicFieldTarget; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DynamicFieldTarget" AS ENUM (
    'STUDENT',
    'INSTRUCTOR'
);


ALTER TYPE public."DynamicFieldTarget" OWNER TO postgres;

--
-- Name: DynamicFieldType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DynamicFieldType" AS ENUM (
    'TEXT',
    'NUMBER',
    'DATE',
    'BOOLEAN'
);


ALTER TYPE public."DynamicFieldType" OWNER TO postgres;

--
-- Name: ExamType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExamType" AS ENUM (
    'MIDTERM',
    'FINAL',
    'QUIZ'
);


ALTER TYPE public."ExamType" OWNER TO postgres;

--
-- Name: ExternalActivityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ExternalActivityType" AS ENUM (
    'SHOOTING_TRAINING',
    'FIELD_TRIP',
    'PRACTICE',
    'OTHER'
);


ALTER TYPE public."ExternalActivityType" OWNER TO postgres;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- Name: InstructorType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InstructorType" AS ENUM (
    'CADRE',
    'EXTERNAL'
);


ALTER TYPE public."InstructorType" OWNER TO postgres;

--
-- Name: LeaveType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LeaveType" AS ENUM (
    'WEEKEND_LEAVE',
    'ANNUAL_LEAVE',
    'EXCUSE_LEAVE',
    'HOSPITALIZATION'
);


ALTER TYPE public."LeaveType" OWNER TO postgres;

--
-- Name: MaritalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."MaritalStatus" OWNER TO postgres;

--
-- Name: SpecialEventType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SpecialEventType" AS ENUM (
    'YOKLAMA',
    'MANAGEMENT',
    'SOCIAL_SPORTS',
    'CEREMONY',
    'ORIENTATION',
    'OTHER'
);


ALTER TYPE public."SpecialEventType" OWNER TO postgres;

--
-- Name: TermDuration; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TermDuration" AS ENUM (
    'FOUR_MONTHS',
    'SIX_MONTHS'
);


ALTER TYPE public."TermDuration" OWNER TO postgres;

--
-- Name: TermStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TermStatus" AS ENUM (
    'ACTIVE',
    'PAUSED',
    'ARCHIVED'
);


ALTER TYPE public."TermStatus" OWNER TO postgres;

--
-- Name: TermType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TermType" AS ENUM (
    'POLICE',
    'FIRE'
);


ALTER TYPE public."TermType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'INSTRUCTOR',
    'STUDENT_AFFAIRS'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendances (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "classId" text NOT NULL,
    "courseId" text,
    date timestamp(3) without time zone NOT NULL,
    status public."AttendanceStatus" NOT NULL,
    "isDormRest" boolean DEFAULT false NOT NULL,
    note text,
    "takenById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "dailyLessonId" text
);


ALTER TABLE public.attendances OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    "userEmail" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "oldValues" jsonb,
    "newValues" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    capacity integer DEFAULT 30 NOT NULL,
    "termId" text NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: conferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conferences (
    id text NOT NULL,
    "conferenceTitle" text NOT NULL,
    topic text NOT NULL,
    description text,
    "externalSpeakerId" text,
    "scheduledDate" date,
    duration integer DEFAULT 2 NOT NULL,
    "startSlot" integer,
    "endSlot" integer,
    "targetClasses" jsonb,
    "isAllClasses" boolean DEFAULT false NOT NULL,
    "requiresSpecialRoom" boolean DEFAULT false NOT NULL,
    "specialRoomType" text,
    "requiredEquipment" jsonb,
    "countsTowardCurriculum" boolean DEFAULT false NOT NULL,
    "courseId" text,
    status public."ConferenceStatus" DEFAULT 'PLANNED'::public."ConferenceStatus" NOT NULL,
    "organizerId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conferences OWNER TO postgres;

--
-- Name: course_instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.course_instructors (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "instructorId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "hoursAssigned" integer
);


ALTER TABLE public.course_instructors OWNER TO postgres;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "targetHours" integer NOT NULL,
    credit integer,
    "courseType" public."CourseType" DEFAULT 'STANDARD'::public."CourseType" NOT NULL,
    description text,
    "termId" text NOT NULL,
    "parentCourseId" text,
    "weightPercentage" double precision,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: daily_lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_lessons (
    id text CONSTRAINT schedule_entries_id_not_null NOT NULL,
    "termId" text CONSTRAINT "schedule_entries_termId_not_null" NOT NULL,
    "classId" text CONSTRAINT "schedule_entries_classId_not_null" NOT NULL,
    "courseId" text CONSTRAINT "schedule_entries_courseId_not_null" NOT NULL,
    "instructorId" text CONSTRAINT "schedule_entries_instructorId_not_null" NOT NULL,
    "dayOfWeek" public."DayOfWeek" CONSTRAINT "schedule_entries_dayOfWeek_not_null" NOT NULL,
    "timeSlotId" text CONSTRAINT "schedule_entries_timeSlotId_not_null" NOT NULL,
    "specificDate" timestamp(3) without time zone,
    "isCancelled" boolean DEFAULT false CONSTRAINT "schedule_entries_isCancelled_not_null" NOT NULL,
    "cancelReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT "schedule_entries_createdAt_not_null" NOT NULL,
    "updatedAt" timestamp(3) without time zone CONSTRAINT "schedule_entries_updatedAt_not_null" NOT NULL
);


ALTER TABLE public.daily_lessons OWNER TO postgres;

--
-- Name: daily_meal_counts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_meal_counts (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "totalStudents" integer DEFAULT 0 NOT NULL,
    "totalStaff" integer DEFAULT 0 NOT NULL,
    "totalGuests" integer DEFAULT 0 NOT NULL,
    "onLeaveCount" integer DEFAULT 0 NOT NULL,
    "hospitalizedCount" integer DEFAULT 0 NOT NULL,
    "weekendDutyStudents" integer DEFAULT 0 NOT NULL,
    "weekendDutyStaff" integer DEFAULT 0 NOT NULL,
    "disciplinaryDuty" integer DEFAULT 0 NOT NULL,
    "grandTotal" integer DEFAULT 0 NOT NULL,
    "isFinalized" boolean DEFAULT false NOT NULL,
    "finalizedById" text,
    "finalizedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.daily_meal_counts OWNER TO postgres;

--
-- Name: disciplinary_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplinary_documents (
    id text NOT NULL,
    "disciplinaryRecordId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileType" text NOT NULL,
    stage text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.disciplinary_documents OWNER TO postgres;

--
-- Name: disciplinary_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disciplinary_records (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "incidentDate" timestamp(3) without time zone NOT NULL,
    "violationTypeId" text NOT NULL,
    "incidentDescription" text,
    "penaltyPoints" integer DEFAULT 0 NOT NULL,
    "penaltyType" public."DisciplinaryPenaltyType",
    "processStatus" public."DisciplinaryProcessStatus" DEFAULT 'INCIDENT_REPORTED'::public."DisciplinaryProcessStatus" NOT NULL,
    "defenseRequestedAt" timestamp(3) without time zone,
    "defenseReceivedAt" timestamp(3) without time zone,
    "boardReviewDate" timestamp(3) without time zone,
    "decisionDate" timestamp(3) without time zone,
    "decisionNote" text,
    "decidedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.disciplinary_records OWNER TO postgres;

--
-- Name: dormitories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dormitories (
    id text NOT NULL,
    number text NOT NULL,
    name text,
    capacity integer NOT NULL,
    "currentOccupancy" integer DEFAULT 0 NOT NULL,
    gender public."Gender" NOT NULL,
    "isReserve" boolean DEFAULT false NOT NULL,
    floor integer,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dormitories OWNER TO postgres;

--
-- Name: dynamic_field_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dynamic_field_values (
    id text NOT NULL,
    "dynamicFieldId" text NOT NULL,
    "studentId" text,
    "instructorId" text,
    "termId" text,
    value jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dynamic_field_values OWNER TO postgres;

--
-- Name: dynamic_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dynamic_fields (
    id text NOT NULL,
    name text NOT NULL,
    "fieldKey" text NOT NULL,
    "fieldType" public."DynamicFieldType" NOT NULL,
    "targetEntity" public."DynamicFieldTarget" NOT NULL,
    "isRequired" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    options text[],
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dynamic_fields OWNER TO postgres;

--
-- Name: exam_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_results (
    id text NOT NULL,
    "examId" text NOT NULL,
    "studentId" text NOT NULL,
    score double precision NOT NULL,
    "previousScore" double precision,
    "enteredById" text,
    "enteredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.exam_results OWNER TO postgres;

--
-- Name: exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exams (
    id text NOT NULL,
    "courseId" text NOT NULL,
    "termId" text NOT NULL,
    "examType" public."ExamType" NOT NULL,
    "examNumber" integer,
    "examDate" timestamp(3) without time zone NOT NULL,
    duration integer NOT NULL,
    "totalPoints" integer DEFAULT 100 NOT NULL,
    "weightPercentage" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.exams OWNER TO postgres;

--
-- Name: external_activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_activities (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "activityType" public."ExternalActivityType" NOT NULL,
    location text NOT NULL,
    description text,
    "classIds" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.external_activities OWNER TO postgres;

--
-- Name: external_speakers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.external_speakers (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    title text,
    organization text,
    department text,
    email text,
    phone text,
    address text,
    expertise jsonb,
    bio text,
    "isActive" boolean DEFAULT true NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.external_speakers OWNER TO postgres;

--
-- Name: instructor_availabilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor_availabilities (
    id text NOT NULL,
    "instructorId" text NOT NULL,
    "dayOfWeek" public."DayOfWeek" NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    note text
);


ALTER TABLE public.instructor_availabilities OWNER TO postgres;

--
-- Name: instructor_terms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructor_terms (
    id text NOT NULL,
    "instructorId" text NOT NULL,
    "termId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.instructor_terms OWNER TO postgres;

--
-- Name: instructors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instructors (
    id text NOT NULL,
    "tcKimlikNo" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text,
    "instructorType" public."InstructorType" NOT NULL,
    rank text,
    "badgeNumber" text,
    institution text,
    branch text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text
);


ALTER TABLE public.instructors OWNER TO postgres;

--
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaves (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "leaveType" public."LeaveType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    reason text,
    "documentUrl" text,
    "isApproved" boolean DEFAULT false NOT NULL,
    "approvedById" text,
    "approvedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.leaves OWNER TO postgres;

--
-- Name: meal_exclusions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_exclusions (
    id text NOT NULL,
    "dailyMealCountId" text NOT NULL,
    "studentId" text,
    "isExcluded" boolean NOT NULL,
    reason text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text
);


ALTER TABLE public.meal_exclusions OWNER TO postgres;

--
-- Name: meal_guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_guests (
    id text NOT NULL,
    "dailyMealCountId" text NOT NULL,
    "guestCount" integer NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text
);


ALTER TABLE public.meal_guests OWNER TO postgres;

--
-- Name: officer_duties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.officer_duties (
    id text NOT NULL,
    "instructorId" text NOT NULL,
    "dutyDate" timestamp(3) without time zone NOT NULL,
    "dutyType" public."DutyType" NOT NULL,
    "isBlockedNextDay" boolean DEFAULT true NOT NULL,
    "blockOverridden" boolean DEFAULT false NOT NULL,
    source public."DutySource" DEFAULT 'REGULAR'::public."DutySource" NOT NULL,
    "swappedWithId" text,
    "swapNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.officer_duties OWNER TO postgres;

--
-- Name: public_holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.public_holidays (
    id text NOT NULL,
    name text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "isRecurring" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.public_holidays OWNER TO postgres;

--
-- Name: schedule_swaps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schedule_swaps (
    id text NOT NULL,
    "originalDate" timestamp(3) without time zone NOT NULL,
    "originalInstructorId" text NOT NULL,
    "originalCourseId" text NOT NULL,
    "replacementDate" timestamp(3) without time zone,
    "replacementInstructorId" text,
    "replacementCourseId" text,
    reason text NOT NULL,
    "isDebtSettled" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdById" text
);


ALTER TABLE public.schedule_swaps OWNER TO postgres;

--
-- Name: shooting_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shooting_records (
    id text NOT NULL,
    "externalActivityId" text NOT NULL,
    "studentId" text NOT NULL,
    distance integer NOT NULL,
    "weaponType" text NOT NULL,
    "roundsFired" integer NOT NULL,
    "ammunitionUsed" integer NOT NULL,
    score double precision,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shooting_records OWNER TO postgres;

--
-- Name: special_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special_events (
    id text NOT NULL,
    "eventType" public."SpecialEventType" NOT NULL,
    "eventTitle" text NOT NULL,
    description text,
    duration integer DEFAULT 1 NOT NULL,
    "dayOfWeek" integer,
    "slotIndex" integer,
    "requiresInstructor" boolean DEFAULT false NOT NULL,
    "allClassesTogether" boolean DEFAULT false NOT NULL,
    "countsTowardCurriculum" boolean DEFAULT false NOT NULL,
    "managedBy" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.special_events OWNER TO postgres;

--
-- Name: student_course_grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_course_grades (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "courseId" text NOT NULL,
    "midtermAverage" double precision,
    "finalScore" double precision,
    "calculatedGrade" double precision,
    "letterGrade" text,
    "isPassed" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_course_grades OWNER TO postgres;

--
-- Name: student_discipline_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_discipline_scores (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "initialScore" integer DEFAULT 100 NOT NULL,
    "currentScore" integer DEFAULT 100 NOT NULL,
    "isCritical" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_discipline_scores OWNER TO postgres;

--
-- Name: student_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_documents (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileType" text NOT NULL,
    description text,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.student_documents OWNER TO postgres;

--
-- Name: student_duties; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_duties (
    id text NOT NULL,
    "studentId" text NOT NULL,
    "dutyDate" timestamp(3) without time zone NOT NULL,
    "dutyType" public."DutyType" NOT NULL,
    source public."DutySource" DEFAULT 'REGULAR'::public."DutySource" NOT NULL,
    "disciplinaryRecordId" text,
    "swappedWithId" text,
    "swapNote" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_duties OWNER TO postgres;

--
-- Name: student_gpas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_gpas (
    id text NOT NULL,
    "studentId" text NOT NULL,
    gpa double precision DEFAULT 0 NOT NULL,
    "totalCredits" integer DEFAULT 0 NOT NULL,
    "disciplineScore" double precision DEFAULT 100 NOT NULL,
    "classRank" integer,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.student_gpas OWNER TO postgres;

--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id text NOT NULL,
    "tcKimlikNo" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    gender public."Gender" NOT NULL,
    "birthDate" timestamp(3) without time zone NOT NULL,
    email text,
    phone text,
    address text,
    "motherName" text,
    "motherSurname" text,
    "motherEducation" text,
    "fatherName" text,
    "fatherSurname" text,
    "fatherEducation" text,
    "maritalStatus" public."MaritalStatus",
    "highSchool" text,
    university text,
    faculty text,
    department text,
    "photoUrl" text,
    "termId" text,
    "classId" text,
    "dormitoryId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdById" text
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: terms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.terms (
    id text NOT NULL,
    name text NOT NULL,
    "termNumber" integer NOT NULL,
    "termCode" text NOT NULL,
    "termType" public."TermType" NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    description text,
    "isDeleted" boolean DEFAULT false NOT NULL,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    duration public."TermDuration" NOT NULL,
    status public."TermStatus" DEFAULT 'ACTIVE'::public."TermStatus" NOT NULL
);


ALTER TABLE public.terms OWNER TO postgres;

--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_slots (
    id text NOT NULL,
    "slotNumber" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isBreak" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.time_slots OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "visibleName" text NOT NULL,
    role public."UserRole" DEFAULT 'INSTRUCTOR'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "instructorId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: violation_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.violation_types (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "defaultPoints" integer NOT NULL
);


ALTER TABLE public.violation_types OWNER TO postgres;

--
-- Data for Name: attendances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendances (id, "studentId", "classId", "courseId", date, status, "isDormRest", note, "takenById", "createdAt", "updatedAt", "dailyLessonId") FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", "userEmail", action, entity, "entityId", "oldValues", "newValues", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (id, name, code, capacity, "termId", "isDeleted", "deletedAt", "createdAt", "updatedAt") FROM stdin;
cmjj2w82d0001135x867urtir	A	A	33	cmjirjxny0000qs0diploct0k	f	\N	2025-12-23 21:09:54.517	2025-12-23 21:09:54.517
\.


--
-- Data for Name: conferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conferences (id, "conferenceTitle", topic, description, "externalSpeakerId", "scheduledDate", duration, "startSlot", "endSlot", "targetClasses", "isAllClasses", "requiresSpecialRoom", "specialRoomType", "requiredEquipment", "countsTowardCurriculum", "courseId", status, "organizerId", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: course_instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.course_instructors (id, "courseId", "instructorId", "assignedAt", "hoursAssigned") FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.courses (id, code, name, "targetHours", credit, "courseType", description, "termId", "parentCourseId", "weightPercentage", "isDeleted", "deletedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: daily_lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_lessons (id, "termId", "classId", "courseId", "instructorId", "dayOfWeek", "timeSlotId", "specificDate", "isCancelled", "cancelReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: daily_meal_counts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_meal_counts (id, date, "totalStudents", "totalStaff", "totalGuests", "onLeaveCount", "hospitalizedCount", "weekendDutyStudents", "weekendDutyStaff", "disciplinaryDuty", "grandTotal", "isFinalized", "finalizedById", "finalizedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: disciplinary_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplinary_documents (id, "disciplinaryRecordId", "fileName", "fileUrl", "fileType", stage, "uploadedAt") FROM stdin;
\.


--
-- Data for Name: disciplinary_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disciplinary_records (id, "studentId", "incidentDate", "violationTypeId", "incidentDescription", "penaltyPoints", "penaltyType", "processStatus", "defenseRequestedAt", "defenseReceivedAt", "boardReviewDate", "decisionDate", "decisionNote", "decidedById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dormitories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dormitories (id, number, name, capacity, "currentOccupancy", gender, "isReserve", floor, "isDeleted", "deletedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dynamic_field_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dynamic_field_values (id, "dynamicFieldId", "studentId", "instructorId", "termId", value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: dynamic_fields; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dynamic_fields (id, name, "fieldKey", "fieldType", "targetEntity", "isRequired", "isActive", options, "sortOrder", "isDeleted", "deletedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: exam_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exam_results (id, "examId", "studentId", score, "previousScore", "enteredById", "enteredAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: exams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.exams (id, "courseId", "termId", "examType", "examNumber", "examDate", duration, "totalPoints", "weightPercentage", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: external_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_activities (id, date, "activityType", location, description, "classIds", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: external_speakers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.external_speakers (id, "firstName", "lastName", title, organization, department, email, phone, address, expertise, bio, "isActive", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: instructor_availabilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructor_availabilities (id, "instructorId", "dayOfWeek", "startTime", "endTime", "isAvailable", note) FROM stdin;
\.


--
-- Data for Name: instructor_terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructor_terms (id, "instructorId", "termId", "assignedAt") FROM stdin;
\.


--
-- Data for Name: instructors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instructors (id, "tcKimlikNo", "firstName", "lastName", email, phone, "instructorType", rank, "badgeNumber", institution, branch, "isActive", "isDeleted", "deletedAt", "createdAt", "updatedAt", "createdById") FROM stdin;
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (id, "studentId", "leaveType", "startDate", "endDate", reason, "documentUrl", "isApproved", "approvedById", "approvedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: meal_exclusions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meal_exclusions (id, "dailyMealCountId", "studentId", "isExcluded", reason, "createdAt", "createdById") FROM stdin;
\.


--
-- Data for Name: meal_guests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meal_guests (id, "dailyMealCountId", "guestCount", description, "createdAt", "createdById") FROM stdin;
\.


--
-- Data for Name: officer_duties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.officer_duties (id, "instructorId", "dutyDate", "dutyType", "isBlockedNextDay", "blockOverridden", source, "swappedWithId", "swapNote", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: public_holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.public_holidays (id, name, date, "isRecurring", "createdAt") FROM stdin;
\.


--
-- Data for Name: schedule_swaps; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schedule_swaps (id, "originalDate", "originalInstructorId", "originalCourseId", "replacementDate", "replacementInstructorId", "replacementCourseId", reason, "isDebtSettled", "createdAt", "createdById") FROM stdin;
\.


--
-- Data for Name: shooting_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shooting_records (id, "externalActivityId", "studentId", distance, "weaponType", "roundsFired", "ammunitionUsed", score, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: special_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.special_events (id, "eventType", "eventTitle", description, duration, "dayOfWeek", "slotIndex", "requiresInstructor", "allClassesTogether", "countsTowardCurriculum", "managedBy", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: student_course_grades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_course_grades (id, "studentId", "courseId", "midtermAverage", "finalScore", "calculatedGrade", "letterGrade", "isPassed", "updatedAt") FROM stdin;
\.


--
-- Data for Name: student_discipline_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_discipline_scores (id, "studentId", "initialScore", "currentScore", "isCritical", "updatedAt") FROM stdin;
\.


--
-- Data for Name: student_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_documents (id, "studentId", "fileName", "fileUrl", "fileType", description, "uploadedAt") FROM stdin;
\.


--
-- Data for Name: student_duties; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_duties (id, "studentId", "dutyDate", "dutyType", source, "disciplinaryRecordId", "swappedWithId", "swapNote", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: student_gpas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.student_gpas (id, "studentId", gpa, "totalCredits", "disciplineScore", "classRank", "updatedAt") FROM stdin;
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.students (id, "tcKimlikNo", "firstName", "lastName", gender, "birthDate", email, phone, address, "motherName", "motherSurname", "motherEducation", "fatherName", "fatherSurname", "fatherEducation", "maritalStatus", "highSchool", university, faculty, department, "photoUrl", "termId", "classId", "dormitoryId", "isActive", "isDeleted", "deletedAt", "createdAt", "updatedAt", "createdById") FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_settings (id, key, value, "updatedAt") FROM stdin;
\.


--
-- Data for Name: terms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.terms (id, name, "termNumber", "termCode", "termType", "startDate", "endDate", description, "isDeleted", "deletedAt", "createdAt", "updatedAt", duration, status) FROM stdin;
cmjirjxny0000qs0diploct0k	68. Polis Temel Eğitimi	68	PTE-68	POLICE	2025-12-31 00:00:00	2026-04-30 00:00:00	\N	f	\N	2025-12-23 15:52:25.39	2025-12-23 22:23:41.79	FOUR_MONTHS	ACTIVE
cmjirk9ms0001qs0d5k9w2gwm	18. İtfaiye Temel Eğitimi	18	İTE-18	FIRE	2025-12-31 00:00:00	2026-04-30 00:00:00	\N	f	\N	2025-12-23 15:52:40.901	2025-12-24 15:43:58.605	FOUR_MONTHS	ACTIVE
cmjk924dd0000rwifx7keripy	69. Polis Temel Eğitimi	69	PTE-69	POLICE	2026-02-28 00:00:00	2026-06-27 00:00:00	\N	f	\N	2025-12-24 16:50:13.537	2025-12-24 17:50:59.721	FOUR_MONTHS	ACTIVE
\.


--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_slots (id, "slotNumber", "startTime", "endTime", "isBreak") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, "firstName", "lastName", "visibleName", role, "isActive", "instructorId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: violation_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.violation_types (id, code, name, description, "defaultPoints") FROM stdin;
\.


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: conferences conferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conferences
    ADD CONSTRAINT conferences_pkey PRIMARY KEY (id);


--
-- Name: course_instructors course_instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT course_instructors_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: daily_lessons daily_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_lessons
    ADD CONSTRAINT daily_lessons_pkey PRIMARY KEY (id);


--
-- Name: daily_meal_counts daily_meal_counts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_meal_counts
    ADD CONSTRAINT daily_meal_counts_pkey PRIMARY KEY (id);


--
-- Name: disciplinary_documents disciplinary_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_documents
    ADD CONSTRAINT disciplinary_documents_pkey PRIMARY KEY (id);


--
-- Name: disciplinary_records disciplinary_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_records
    ADD CONSTRAINT disciplinary_records_pkey PRIMARY KEY (id);


--
-- Name: dormitories dormitories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dormitories
    ADD CONSTRAINT dormitories_pkey PRIMARY KEY (id);


--
-- Name: dynamic_field_values dynamic_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_field_values
    ADD CONSTRAINT dynamic_field_values_pkey PRIMARY KEY (id);


--
-- Name: dynamic_fields dynamic_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_fields
    ADD CONSTRAINT dynamic_fields_pkey PRIMARY KEY (id);


--
-- Name: exam_results exam_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: external_activities external_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_activities
    ADD CONSTRAINT external_activities_pkey PRIMARY KEY (id);


--
-- Name: external_speakers external_speakers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.external_speakers
    ADD CONSTRAINT external_speakers_pkey PRIMARY KEY (id);


--
-- Name: instructor_availabilities instructor_availabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_availabilities
    ADD CONSTRAINT instructor_availabilities_pkey PRIMARY KEY (id);


--
-- Name: instructor_terms instructor_terms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_terms
    ADD CONSTRAINT instructor_terms_pkey PRIMARY KEY (id);


--
-- Name: instructors instructors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT instructors_pkey PRIMARY KEY (id);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- Name: meal_exclusions meal_exclusions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_exclusions
    ADD CONSTRAINT meal_exclusions_pkey PRIMARY KEY (id);


--
-- Name: meal_guests meal_guests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_guests
    ADD CONSTRAINT meal_guests_pkey PRIMARY KEY (id);


--
-- Name: officer_duties officer_duties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.officer_duties
    ADD CONSTRAINT officer_duties_pkey PRIMARY KEY (id);


--
-- Name: public_holidays public_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.public_holidays
    ADD CONSTRAINT public_holidays_pkey PRIMARY KEY (id);


--
-- Name: schedule_swaps schedule_swaps_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schedule_swaps
    ADD CONSTRAINT schedule_swaps_pkey PRIMARY KEY (id);


--
-- Name: shooting_records shooting_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shooting_records
    ADD CONSTRAINT shooting_records_pkey PRIMARY KEY (id);


--
-- Name: special_events special_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special_events
    ADD CONSTRAINT special_events_pkey PRIMARY KEY (id);


--
-- Name: student_course_grades student_course_grades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_course_grades
    ADD CONSTRAINT student_course_grades_pkey PRIMARY KEY (id);


--
-- Name: student_discipline_scores student_discipline_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_discipline_scores
    ADD CONSTRAINT student_discipline_scores_pkey PRIMARY KEY (id);


--
-- Name: student_documents student_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT student_documents_pkey PRIMARY KEY (id);


--
-- Name: student_duties student_duties_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_duties
    ADD CONSTRAINT student_duties_pkey PRIMARY KEY (id);


--
-- Name: student_gpas student_gpas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_gpas
    ADD CONSTRAINT student_gpas_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: terms terms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.terms
    ADD CONSTRAINT terms_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: violation_types violation_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.violation_types
    ADD CONSTRAINT violation_types_pkey PRIMARY KEY (id);


--
-- Name: attendances_dailyLessonId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "attendances_dailyLessonId_idx" ON public.attendances USING btree ("dailyLessonId");


--
-- Name: attendances_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX attendances_date_idx ON public.attendances USING btree (date);


--
-- Name: attendances_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX attendances_status_idx ON public.attendances USING btree (status);


--
-- Name: attendances_studentId_date_classId_dailyLessonId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "attendances_studentId_date_classId_dailyLessonId_key" ON public.attendances USING btree ("studentId", date, "classId", "dailyLessonId");


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_entity_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_entity_entityId_idx" ON public.audit_logs USING btree (entity, "entityId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: classes_termId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "classes_termId_code_key" ON public.classes USING btree ("termId", code);


--
-- Name: conferences_courseId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conferences_courseId_idx" ON public.conferences USING btree ("courseId");


--
-- Name: conferences_externalSpeakerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conferences_externalSpeakerId_idx" ON public.conferences USING btree ("externalSpeakerId");


--
-- Name: conferences_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "conferences_scheduledDate_idx" ON public.conferences USING btree ("scheduledDate");


--
-- Name: conferences_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conferences_status_idx ON public.conferences USING btree (status);


--
-- Name: course_instructors_courseId_instructorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "course_instructors_courseId_instructorId_key" ON public.course_instructors USING btree ("courseId", "instructorId");


--
-- Name: courses_termId_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "courses_termId_code_key" ON public.courses USING btree ("termId", code);


--
-- Name: daily_lessons_classId_dayOfWeek_timeSlotId_specificDate_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "daily_lessons_classId_dayOfWeek_timeSlotId_specificDate_key" ON public.daily_lessons USING btree ("classId", "dayOfWeek", "timeSlotId", "specificDate");


--
-- Name: daily_lessons_instructorId_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "daily_lessons_instructorId_dayOfWeek_idx" ON public.daily_lessons USING btree ("instructorId", "dayOfWeek");


--
-- Name: daily_meal_counts_date_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX daily_meal_counts_date_key ON public.daily_meal_counts USING btree (date);


--
-- Name: disciplinary_records_processStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "disciplinary_records_processStatus_idx" ON public.disciplinary_records USING btree ("processStatus");


--
-- Name: disciplinary_records_studentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "disciplinary_records_studentId_idx" ON public.disciplinary_records USING btree ("studentId");


--
-- Name: dormitories_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX dormitories_number_key ON public.dormitories USING btree (number);


--
-- Name: dynamic_field_values_dynamicFieldId_instructorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "dynamic_field_values_dynamicFieldId_instructorId_key" ON public.dynamic_field_values USING btree ("dynamicFieldId", "instructorId");


--
-- Name: dynamic_field_values_dynamicFieldId_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "dynamic_field_values_dynamicFieldId_studentId_key" ON public.dynamic_field_values USING btree ("dynamicFieldId", "studentId");


--
-- Name: dynamic_fields_fieldKey_targetEntity_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "dynamic_fields_fieldKey_targetEntity_key" ON public.dynamic_fields USING btree ("fieldKey", "targetEntity");


--
-- Name: exam_results_examId_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "exam_results_examId_studentId_key" ON public.exam_results USING btree ("examId", "studentId");


--
-- Name: exams_courseId_examType_examNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "exams_courseId_examType_examNumber_key" ON public.exams USING btree ("courseId", "examType", "examNumber");


--
-- Name: external_speakers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX external_speakers_email_key ON public.external_speakers USING btree (email);


--
-- Name: external_speakers_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "external_speakers_isActive_idx" ON public.external_speakers USING btree ("isActive");


--
-- Name: external_speakers_lastName_firstName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "external_speakers_lastName_firstName_idx" ON public.external_speakers USING btree ("lastName", "firstName");


--
-- Name: external_speakers_organization_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX external_speakers_organization_idx ON public.external_speakers USING btree (organization);


--
-- Name: instructor_availabilities_instructorId_dayOfWeek_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "instructor_availabilities_instructorId_dayOfWeek_key" ON public.instructor_availabilities USING btree ("instructorId", "dayOfWeek");


--
-- Name: instructor_terms_instructorId_termId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "instructor_terms_instructorId_termId_key" ON public.instructor_terms USING btree ("instructorId", "termId");


--
-- Name: instructors_tcKimlikNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "instructors_tcKimlikNo_key" ON public.instructors USING btree ("tcKimlikNo");


--
-- Name: leaves_studentId_startDate_endDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "leaves_studentId_startDate_endDate_idx" ON public.leaves USING btree ("studentId", "startDate", "endDate");


--
-- Name: officer_duties_instructorId_dutyDate_dutyType_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "officer_duties_instructorId_dutyDate_dutyType_key" ON public.officer_duties USING btree ("instructorId", "dutyDate", "dutyType");


--
-- Name: shooting_records_externalActivityId_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "shooting_records_externalActivityId_studentId_key" ON public.shooting_records USING btree ("externalActivityId", "studentId");


--
-- Name: special_events_dayOfWeek_slotIndex_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "special_events_dayOfWeek_slotIndex_idx" ON public.special_events USING btree ("dayOfWeek", "slotIndex");


--
-- Name: special_events_eventType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "special_events_eventType_idx" ON public.special_events USING btree ("eventType");


--
-- Name: student_course_grades_studentId_courseId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_course_grades_studentId_courseId_key" ON public.student_course_grades USING btree ("studentId", "courseId");


--
-- Name: student_discipline_scores_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_discipline_scores_studentId_key" ON public.student_discipline_scores USING btree ("studentId");


--
-- Name: student_duties_dutyDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "student_duties_dutyDate_idx" ON public.student_duties USING btree ("dutyDate");


--
-- Name: student_duties_studentId_dutyDate_dutyType_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_duties_studentId_dutyDate_dutyType_key" ON public.student_duties USING btree ("studentId", "dutyDate", "dutyType");


--
-- Name: student_gpas_studentId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "student_gpas_studentId_key" ON public.student_gpas USING btree ("studentId");


--
-- Name: students_classId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_classId_idx" ON public.students USING btree ("classId");


--
-- Name: students_dormitoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_dormitoryId_idx" ON public.students USING btree ("dormitoryId");


--
-- Name: students_tcKimlikNo_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_tcKimlikNo_idx" ON public.students USING btree ("tcKimlikNo");


--
-- Name: students_tcKimlikNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "students_tcKimlikNo_key" ON public.students USING btree ("tcKimlikNo");


--
-- Name: students_termId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "students_termId_idx" ON public.students USING btree ("termId");


--
-- Name: system_settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);


--
-- Name: terms_termCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "terms_termCode_key" ON public.terms USING btree ("termCode");


--
-- Name: time_slots_startTime_endTime_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "time_slots_startTime_endTime_key" ON public.time_slots USING btree ("startTime", "endTime");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_instructorId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "users_instructorId_key" ON public.users USING btree ("instructorId");


--
-- Name: violation_types_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX violation_types_code_key ON public.violation_types USING btree (code);


--
-- Name: attendances attendances_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "attendances_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "attendances_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendances attendances_dailyLessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "attendances_dailyLessonId_fkey" FOREIGN KEY ("dailyLessonId") REFERENCES public.daily_lessons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: attendances attendances_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: attendances attendances_takenById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT "attendances_takenById_fkey" FOREIGN KEY ("takenById") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: classes classes_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT "classes_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: conferences conferences_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conferences
    ADD CONSTRAINT "conferences_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conferences conferences_externalSpeakerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conferences
    ADD CONSTRAINT "conferences_externalSpeakerId_fkey" FOREIGN KEY ("externalSpeakerId") REFERENCES public.external_speakers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: course_instructors course_instructors_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT "course_instructors_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: course_instructors course_instructors_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.course_instructors
    ADD CONSTRAINT "course_instructors_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: courses courses_parentCourseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_parentCourseId_fkey" FOREIGN KEY ("parentCourseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: courses courses_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT "courses_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_lessons daily_lessons_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_lessons
    ADD CONSTRAINT "daily_lessons_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_lessons daily_lessons_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_lessons
    ADD CONSTRAINT "daily_lessons_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_lessons daily_lessons_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_lessons
    ADD CONSTRAINT "daily_lessons_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: daily_lessons daily_lessons_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_lessons
    ADD CONSTRAINT "daily_lessons_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_lessons daily_lessons_timeSlotId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_lessons
    ADD CONSTRAINT "daily_lessons_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES public.time_slots(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disciplinary_documents disciplinary_documents_disciplinaryRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_documents
    ADD CONSTRAINT "disciplinary_documents_disciplinaryRecordId_fkey" FOREIGN KEY ("disciplinaryRecordId") REFERENCES public.disciplinary_records(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disciplinary_records disciplinary_records_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_records
    ADD CONSTRAINT "disciplinary_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disciplinary_records disciplinary_records_violationTypeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disciplinary_records
    ADD CONSTRAINT "disciplinary_records_violationTypeId_fkey" FOREIGN KEY ("violationTypeId") REFERENCES public.violation_types(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dynamic_field_values dynamic_field_values_dynamicFieldId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_field_values
    ADD CONSTRAINT "dynamic_field_values_dynamicFieldId_fkey" FOREIGN KEY ("dynamicFieldId") REFERENCES public.dynamic_fields(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dynamic_field_values dynamic_field_values_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_field_values
    ADD CONSTRAINT "dynamic_field_values_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dynamic_field_values dynamic_field_values_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_field_values
    ADD CONSTRAINT "dynamic_field_values_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: dynamic_field_values dynamic_field_values_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dynamic_field_values
    ADD CONSTRAINT "dynamic_field_values_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: exam_results exam_results_examId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT "exam_results_examId_fkey" FOREIGN KEY ("examId") REFERENCES public.exams(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: exam_results exam_results_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT "exam_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: exams exams_courseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT "exams_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES public.courses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: exams exams_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT "exams_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: instructor_availabilities instructor_availabilities_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_availabilities
    ADD CONSTRAINT "instructor_availabilities_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: instructor_terms instructor_terms_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_terms
    ADD CONSTRAINT "instructor_terms_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: instructor_terms instructor_terms_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructor_terms
    ADD CONSTRAINT "instructor_terms_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: instructors instructors_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instructors
    ADD CONSTRAINT "instructors_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: leaves leaves_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT "leaves_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meal_exclusions meal_exclusions_dailyMealCountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_exclusions
    ADD CONSTRAINT "meal_exclusions_dailyMealCountId_fkey" FOREIGN KEY ("dailyMealCountId") REFERENCES public.daily_meal_counts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: meal_exclusions meal_exclusions_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_exclusions
    ADD CONSTRAINT "meal_exclusions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: meal_guests meal_guests_dailyMealCountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_guests
    ADD CONSTRAINT "meal_guests_dailyMealCountId_fkey" FOREIGN KEY ("dailyMealCountId") REFERENCES public.daily_meal_counts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: officer_duties officer_duties_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.officer_duties
    ADD CONSTRAINT "officer_duties_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shooting_records shooting_records_externalActivityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shooting_records
    ADD CONSTRAINT "shooting_records_externalActivityId_fkey" FOREIGN KEY ("externalActivityId") REFERENCES public.external_activities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shooting_records shooting_records_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shooting_records
    ADD CONSTRAINT "shooting_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_documents student_documents_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_documents
    ADD CONSTRAINT "student_documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: student_duties student_duties_disciplinaryRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_duties
    ADD CONSTRAINT "student_duties_disciplinaryRecordId_fkey" FOREIGN KEY ("disciplinaryRecordId") REFERENCES public.disciplinary_records(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: student_duties student_duties_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_duties
    ADD CONSTRAINT "student_duties_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: students students_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_classId_fkey" FOREIGN KEY ("classId") REFERENCES public.classes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_dormitoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_dormitoryId_fkey" FOREIGN KEY ("dormitoryId") REFERENCES public.dormitories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: students students_termId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT "students_termId_fkey" FOREIGN KEY ("termId") REFERENCES public.terms(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_instructorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES public.instructors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict 5oCeJya1cDOGZurfEfLfzPaeXUuMSAMDs8Y0tdfGvzUgJluF67Bd5OCEwU0Rns1

