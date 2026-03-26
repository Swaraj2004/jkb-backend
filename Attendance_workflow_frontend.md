# Attendance API Workflow (Frontend Handoff)

This document lists the **exact** endpoints and request/response shapes used by the attendance feature.

## Base info

- **Base URL prefix**: all endpoints below start with `/api/v3`
- **Auth**: send header `Authorization: Bearer <jwt>`
- **Roles**: `student`, `professor`, `admin`, `super_admin`
- **Important ID contract**:
  - `Attendance.student_id` is **`StudentDetail.id`** (NOT `User.id`)
  - JWT payload contains `user_id` (this is `User.id`)
  - For `STUDENT_ROLE`, backend derives `StudentDetail.id` from JWT automatically where applicable.

## Workflow (high level)

1. Admin assigns **professors + students** to a batch.
2. Professor creates a lecture for that batch.
3. Professor starts attendance by toggling lecture (or batch lectures) `attendance_toggle = true`.
4. Students mark attendance while toggle is `true`.
5. Professor closes attendance by toggling `attendance_toggle = false`.
6. Students view per-lecture status (`present/absent`) computed from existing rows only (no absent rows inserted).

## Attendance endpoints (mounted by `src/routes/attendanceRoutes.ts`)

### 1) Get attendance for a lecture (Professor/Admin)

**GET** `/api/v3/lectures/:lecture_id/attendance`

- **Auth roles**: `admin`, `professor` (also works for `super_admin` because of middleware)
- **Path params**:
  - `lecture_id`: `string` (Lecture.id)
- **Notes / rules**:
  - If `professor`, lecture must belong to you (`Lecture.professor_id === jwt.user_id`)
- **Response (success)**: HTTP `200`

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": [
    {
      "student_id": "StudentDetail.id",
      "student_name": "Full Name",
      "present": true
    }
  ]
}
```

- **Response (errors)**:
  - `400`: missing lecture id
  - `403`: professor trying to access another professor’s lecture
  - `404`: lecture not found

---

### 2) Toggle attendance for a specific lecture (Professor/Admin)

**PUT** `/api/v3/lectures/:lecture_id/toggle-attendance`

- **Auth roles**: `admin`, `professor` (+ `super_admin`)
- **Path params**:
  - `lecture_id`: `string`
- **Body**:

```json
{
  "attendance_toggle": true
}
```

- **Rules**:
  - If `professor`, lecture must belong to you
- **Response (success)**: HTTP `200`

```json
{
  "success": true,
  "message": "Lecture attendance toggled successfully",
  "data": {
    "id": "Lecture.id",
    "attendance_toggle": true
  }
}
```

---

### 3) Toggle attendance for all lectures in a batch (Professor/Admin)

**PUT** `/api/v3/batches/:batch_id/toggle-attendance`

- **Auth roles**: `admin`, `professor` (+ `super_admin`)
- **Path params**:
  - `batch_id`: `string` (Batch.id)
- **Body**:

```json
{
  "attendance_toggle": false
}
```

- **Rules**:
  - If `professor`, you must be assigned to the batch (`BatchProfessor` exists)
  - This updates **all lectures** in the batch (`updateMany`)
- **Response (success)**: HTTP `200`

```json
{
  "success": true,
  "message": "Batch attendance toggled successfully",
  "data": {
    "batch_id": "Batch.id",
    "updated_lectures": 3,
    "attendance_toggle": false
  }
}
```

---

### 4) Mark attendance (Student/Professor/Admin)

**POST** `/api/v3/student/mark-attendance`

- **Auth roles**: `student`, `professor`, `admin` (+ `super_admin`)
- **Body**:

```json
{
  "lecture_id": "Lecture.id",
  "student_id": "StudentDetail.id"
}
```

- **Important behavior**:
  - If role is `student`: backend **ignores** `student_id` in body and derives it from JWT (`User.id -> StudentDetail.id`).
  - If role is `admin/super_admin`: backend uses the provided `student_id` (must be `StudentDetail.id`).
  - If role is `professor`: backend uses provided `student_id` but enforces:
    - lecture must belong to professor
    - student must be enrolled in the lecture’s batch
  - Attendance is only allowed when `Lecture.attendance_toggle === true`.
  - Marking is idempotent: if already marked, it returns success with message `"Attendance already marked"`.

- **Response (success)**: HTTP `201`

```json
{
  "success": true,
  "message": "Attendance Marked Successfully",
  "data": "Lecture.id"
}
```

- **Response (already marked)**: HTTP `201`

```json
{
  "success": true,
  "message": "Attendance already marked",
  "data": "Lecture.id"
}
```

- **Common error responses**:
  - `400`: missing lecture_id, invalid student_id for admin/professor
  - `403`: attendance closed (`attendance_toggle = false`), not enrolled, professor mismatch
  - `404`: lecture not found

---

### 5) Get batches for a student (Student/Admin/Professor)

**GET** `/api/v3/student/batches`

- **Auth roles**: `student`, `professor`, `admin` (+ `super_admin`)
- **Query params**:
  - `student_id` (optional for `student`, required for non-student): `StudentDetail.id`
- **Role behavior**:
  - `student`: backend derives student detail id from JWT, so frontend can omit `student_id`.
  - `admin/professor/super_admin`: pass `student_id=StudentDetail.id`.

- **Response (success)**: HTTP `200`

```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "studentBatches": [
      {
        "batch": {
          "id": "Batch.id",
          "name": "Batch Name"
        }
      }
    ]
  }
}
```

---

### 6) Get per-lecture attendance status for a batch (Student/Admin/Professor)

**GET** `/api/v3/student/batchAttendance`

- **Auth roles**: `student`, `professor`, `admin` (+ `super_admin`)
- **Query params**:
  - `batch_id`: `Batch.id` (required)
  - `student_id`: `StudentDetail.id` (optional for `student`; required for non-student)

- **Rules**:
  - If role is `student`: must be enrolled in the batch (else `403`)
  - If role is `professor`: must be assigned to the batch (else `403`)
  - **Absent rows are not inserted**; status is computed.

- **Response (success)**: HTTP `200`

```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": [
    {
      "lecture_id": "Lecture.id",
      "lecture_mode": "online|offline|...",
      "professor_name": "Professor Name",
      "attendance_toggle": true,
      "status": "present",
      "created_at": "2026-03-23T10:00:00.000Z"
    }
  ]
}
```

## Professor endpoints that Attendance depends on (mounted by `src/routes/professorRoutes.ts`)

These are mounted under `/api/v3/professor`.

### A) Professor subjects

**GET** `/api/v3/professor/subjects?professor_id=<User.id>`

- **Auth roles**: `admin`, `professor` (+ `super_admin`)
- **Response**: list of `Subject` rows.

### B) Professor lectures

**GET** `/api/v3/professor/lectures?professor_id=<User.id>`

- **Auth roles**: `admin`, `professor` (+ `super_admin`)
- **Response**: list of `Lecture` rows.

### C) Create lecture

**POST** `/api/v3/professor/lectures`

- **Auth roles**: `admin`, `professor` (+ `super_admin`)
- **Body** (from `LectureCreateDTO`):

```json
{
  "subject_id": "Subject.id",
  "professor_id": "User.id",
  "batch_id": "Batch.id",
  "lecture_mode": "string",
  "remark": "string|null",
  "attendance_toggle": true
}
```

- **Professor rule**: if caller is `professor`, backend enforces:
  - `professor_id` must match JWT `user_id`
  - professor must be assigned to the batch (`BatchProfessor`)

- **Response**: HTTP `201`

```json
{
  "success": true,
  "message": "Lecture created successfully",
  "data": "Lecture.id"
}
```

### D) Update lecture attendance toggle (alternate route)

**PUT** `/api/v3/professor/lectures`

- **Auth roles**: `admin`, `professor` (+ `super_admin`)
- **Body**:

```json
{
  "id": "Lecture.id",
  "attendance_toggle": false
}
```

- **Professor rule**: if caller is `professor`, lecture must belong to them.

### E) Batch management (admin + professor)

Mounted under `/api/v3/professor/batches`

- **GET** `/api/v3/professor/batches?professor_id=<User.id>`
  - returns batches assigned to the given professor
- **POST** `/api/v3/professor/batches`
  - **Auth**: `admin` (or `super_admin`)
  - body: `{ "subject_id": "Subject.id", "name": "Batch name" }`
  - creates the batch **without** assigning professors yet
- **PUT** `/api/v3/professor/batches`
  - **Auth**: `admin` (or `super_admin`)
  - body (from `UpdateProfessorBatchDTO`):

```json
{
  "batch_id": "Batch.id",
  "name": "optional string",
  "student_ids": ["StudentDetail.id"],
  "professor_ids": ["User.id"]
}
```

- **Professor assignment happens here** via `professor_ids` (backend replaces existing `BatchProfessor` rows for that batch).

- **DELETE** `/api/v3/professor/batches`
  - **Auth**: `admin` (or `super_admin`)
  - body: `{ "batch_id": "Batch.id" }`

## Notes / gotchas for frontend

- **Student vs User ids**:
  - Wherever you see `student_id` in attendance APIs, it means **`StudentDetail.id`**.
  - If you only have `User.id` for a student, you must first resolve it (backend does this automatically for logged-in `STUDENT_ROLE`).
- **Mark attendance**:
  - Must be rejected by UI if lecture toggle is off; backend will return `403` anyway.
- **Status meaning**:
  - `"present"` means an attendance row exists.
  - `"absent"` means no row exists (no separate absent row is created).
