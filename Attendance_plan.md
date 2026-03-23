# Attendance Feature Plan

## Key Prisma Contract (must be followed)

- `Attendance.student_id` stores `StudentDetail.id`
- “Present” for a student in a lecture = an `Attendance` row exists for `(lecture_id, student_id)`
- “Absent” for a student in a lecture = no `Attendance` row exists for `(lecture_id, student_id)`
- For now, GET endpoints must be **compute-only** (do not insert “absent” rows).

## Roles & Authorization

- `super_admin` can access everything (handled by `authMiddleware.authorizeRoles`).
- `professor` can:
  - only GET attendance for lectures they own (`Lecture.professor_id === req.user.user_id`)
  - only toggle (`Lecture.attendance_toggle`) for lectures they own
  - when marking attendance, must also be for a lecture they own and for students enrolled in that lecture’s batch
- `student` can:
  - view only batches they are enrolled in
  - mark attendance only when `Lecture.attendance_toggle === true`

## StudentId Rule (API contract)

- Client is allowed to send `student_id`, but for `STUDENT_ROLE` the backend **derives** it from JWT:
  - JWT `user_id` -> `StudentDetail.id`

## Workflow

1. `Admin` creates a `Batch` and assigns professors + students.
2. `Professor` creates `Lecture` rows for a batch.
3. `Professor` toggles lecture attendance:
  - set `Lecture.attendance_toggle = true` to allow students to mark
  - set `Lecture.attendance_toggle = false` to close marking
4. `Students` mark attendance while toggle is ON:
  - backend inserts a `Attendance` row for `(lecture_id, student_id)`
  - repeated marking is handled as idempotent “already marked” (present row exists)
5. GET endpoints show `present/absent` based on presence of `Attendance` rows only.

## Implemented/Expected Endpoints

### Professor/Admin/Super Admin

- `GET /api/v3/lectures/:lecture_id/attendance`
  - returns all students in the lecture’s batch with `present: boolean`
- `PUT /api/v3/lectures/:lecture_id/toggle-attendance`
  - body: `{ "attendance_toggle": boolean }`
  - professor can update only their own lecture
- `PUT /api/v3/batches/:batch_id/toggle-attendance` (optional batch-level toggle convenience)
  - body: `{ "attendance_toggle": boolean }`
  - professor can toggle only if assigned to the batch

### Students/Admin/Super Admin

- `GET /api/v3/student/batches?student_id=<StudentDetail.id>`
  - students: backend derives from JWT and ignores query `student_id`
  - returns `{ id, name }` for batches enrolled
- `GET /api/v3/student/batchAttendance?student_id=<StudentDetail.id>&batch_id=<Batch.id>`
  - students: backend verifies enrollment for that batch
  - returns per lecture:
    - `lecture_id`, `lecture_mode`, `professor_name`
    - `attendance_toggle`
    - `status`: `"present"` if an attendance row exists else `"absent"`
- `POST /api/v3/student/mark-attendance`
  - body: `{ lecture_id: <Lecture.id>, student_id?: <StudentDetail.id> }`
  - students: backend derives `student_id` from JWT
  - only allowed when `Lecture.attendance_toggle === true`
  - inserts only the “present” attendance row (no absent-row inserts)

## Files Touched (current implementation)

- `src/controllers/attendanceController.ts`
- `src/routes/attendanceRoutes.ts`
- `src/controllers/professorController.ts`

