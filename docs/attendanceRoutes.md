# Attendance Management API Documentation

- **Route Source**: [src/routes/attendanceRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/attendanceRoutes.ts)
- **Controller Source**: [src/controllers/attendanceController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/attendanceController.ts)
- **Mount Point**: `/api/v3` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L57)
- **Primary Database Models**: `Lecture`, `Attendance`, `StudentDetail`, `Batch`, `StudentBatch`, `BatchProfessor`, `User`

---

## 🎯 Overview & Key Architectural Contracts

The Attendance module handles lecture attendance tracking, professor toggles, student attendance marking, and aggregate computation for lectures and batches.

### 🔑 Critical Contracts & Rules
1. **Student Identifier Convention**:
   - In all attendance endpoints, `student_id` refers to **`StudentDetail.id`** (UUID in `StudentDetail`), NOT `User.id`.
   - When a student (`STUDENT_ROLE`) makes a request, the backend automatically resolves `req.user.user_id` -> `StudentDetail.id` using `resolveStudentDetailId()`. Any client-supplied `student_id` in query/body is safely overridden.
   - For `admin`, `super_admin`, and `professor`, `student_id` must be explicitly passed as the student's `StudentDetail.id`.
2. **Compute-Only "Absent" State**:
   - There are **no absent database rows**. An absent status is purely computed:
     - If an `Attendance` row exists for `(lecture_id, student_id)`: Student is **Present** (`attended_count = count`).
     - If no `Attendance` row exists: Student is **Absent** (`attended_count = 0`).
3. **Attendance Toggling**:
   - Attendance can only be marked by students when `Lecture.attendance_toggle === true`.
   - When toggled ON (`true`), `Lecture.total_count` is incremented by `1`.
4. **Attendance Rate Limiting**:
   - `ATTENDANCE_WAIT_TIME = 2` minutes: If a student attempts to mark attendance again within 2 minutes of the last `updated_at`, the backend rejects with HTTP 500 (`UPDATE_FAILURE`) error to prevent rapid duplicate clicks.
   - Idempotency: If `count >= lecture.total_count`, it returns HTTP 201 with `"Already marked for this session"`.

---

## 🔐 Security & Access Control

| Endpoint | Allowed Roles | Description / Ownership Enforcement |
|---|---|---|
| `GET /api/v3/lectures/:lecture_id/attendance` | `admin`, `professor`, `super_admin` | Professor can only view attendance for lectures they own (`lecture.professor_id === req.user.user_id`). |
| `PUT /api/v3/lectures/:lecture_id/toggle-attendance` | `admin`, `professor`, `super_admin` | Professor can only toggle lectures they own. Increments `total_count` when set to `true`. |
| `POST /api/v3/student/mark-attendance` | `admin`, `professor`, `student`, `super_admin` | Requires active toggle. Verifies batch enrollment. |
| `GET /api/v3/student/batches` | `admin`, `professor`, `student`, `super_admin` | Fetches all batches enrolled by the student. |
| `GET /api/v3/student/batchAttendance` | `admin`, `professor`, `student`, `super_admin` | Computes attendance percentage and lecture breakdown. |
| `PUT /api/v3/batches/:batch_id/toggle-attendance` | `admin`, `professor`, `super_admin` | Toggles `attendance_toggle` across ALL lectures of a batch. |

---

## 📡 Endpoint Details

### 1. Get Lecture Attendance
Fetches the attendance roster of all students enrolled in a lecture's batch.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/lectures/:lecture_id/attendance`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Path Parameters**:
  - `lecture_id` (string, required): UUID of the `Lecture`.

#### Prisma Select Clause Used
The controller selects from `Batch.studentBatches → student → { id, user.full_name }` then maps with `Attendance` records.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "result": [
    {
      "student_id": "8fa3c004-9a85-48b0-8f92-5cb078171120",
      "student_name": "Rohan Sharma",
      "attended_count": 5,
      "total_count": 6,
      "percentage": 83.33333333333334
    }
  ]
}
```

#### Error Responses
- `400 Bad Request`: `{ "success": false, "message": "lectureId is required", "error": null }`
- `403 Forbidden`: `{ "success": false, "message": "Forbidden: lecture does not belong to you", "error": null }`
- `404 Not Found`: `{ "success": false, "message": "Lecture not found", "error": null }`
- `500 Internal Server Error`: `{ "success": false, "message": "Internal server error", "error": null }`

---

### 2. Toggle Lecture Attendance
Opens or closes attendance for a specific lecture. Opening attendance increments the lecture's `total_count`.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/lectures/:lecture_id/toggle-attendance`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Path Parameters**:
  - `lecture_id` (string, required): UUID of the `Lecture`.
- **Request Body**:
```json
{
  "attendance_toggle": true
}
```

#### Notes
- Accepts both actual booleans and string `"true"` / `"false"` — controller converts strings.
- On `true`: Prisma update sets `attendance_toggle: true` and increments `total_count: { increment: 1 }`.

#### Prisma Select after Update: `{ id, attendance_toggle, total_count }`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Lecture attendance toggled successfully",
  "result": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```

- **Error (400 Bad Request)**: `{ "success": false, "message": "attendance_toggle must be a boolean", "error": null }`
- **Error (404 Not Found)**: `{ "success": false, "message": "Lecture not found", "error": null }`
- **Error (403 Forbidden)**: `{ "success": false, "message": "Forbidden: lecture does not belong to you", "error": null }`

---

### 3. Toggle All Lectures in a Batch
Calls `prismaClient.lecture.updateMany` for all lectures in the batch.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/batches/:batch_id/toggle-attendance`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Path Parameters**: `batch_id` (string, required): UUID of the `Batch`.
- **Request Body**: `{ "attendance_toggle": true }`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Batch attendance toggled successfully",
  "result": {
    "batch_id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
    "updated_lectures": 4,
    "attendance_toggle": true
  }
}
```

---

### 4. Mark Student Attendance
Records attendance for a student for an active lecture session.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/student/mark-attendance`
- **Auth**: Required (`admin`, `professor`, `student`, `super_admin`)
- **Request Body**:
```json
{
  "lecture_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "student_id": "8fa3c004-9a85-48b0-8f92-5cb078171120"
}
```
> Note: `student_id` is ignored (overridden by JWT) when the caller is `STUDENT_ROLE`.

#### Flow & Logic
1. Checks if `Lecture.attendance_toggle === true`. If closed, returns `403 Forbidden`.
2. Resolves `student_id` (`StudentDetail.id`) via `resolveStudentDetailId()`.
3. Verifies batch enrollment via `StudentBatch`.
4. If professor is marking: Verifies `Lecture.professor_id === req.user.user_id`.
5. If `Attendance` row already exists:
   - If `count >= lecture.total_count`: Returns HTTP 201 `"Already marked for this session"`.
   - If last `updated_at` is within `ATTENDANCE_WAIT_TIME` (2 min): Returns HTTP 500 with `"Wait to mark-attendance again."` + `lectureId` in `error` field.
   - Else: Increments `count: { increment: 1 }`.
6. If no row: Creates new `Attendance` with `count: 1`.

#### Response (201 Created — Successfully Marked)
```json
{
  "success": true,
  "message": "Attendance Marked Successfully",
  "result": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```

#### Response (201 Already Marked)
```json
{
  "success": true,
  "message": "Already marked for this session",
  "result": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```

#### Error Responses
- `403 Forbidden` (closed attendance): `{ "success": false, "message": "Attendance is closed for this lecture", "error": null }`
- `403 Forbidden` (not enrolled): `{ "success": false, "message": "Forbidden: not enrolled in this lecture batch", "error": null }`
- `500 Update Failure` (rate limited): `{ "success": false, "message": "Wait to mark-attendance again.", "error": "d290f1ee-6c54-4b01-90e6-d701748f0851" }`

---

### 5. Get Student Batches
Retrieves all batches a student is enrolled in via `StudentBatch`.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/student/batches`
- **Auth**: Required (`admin`, `professor`, `student`, `super_admin`)
- **Query Parameters**:
  - `student_id` (string, optional for student role, required for others): `StudentDetail.id`.

#### Prisma Select Clause
```
studentDetail.findUnique({ select: { studentBatches: { select: { batch: { select: { id, name } } } } } })
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "result": {
    "studentBatches": [
      {
        "batch": {
          "id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
          "name": "Batch A - Mathematics 2026"
        }
      }
    ]
  }
}
```

---

### 6. Get Student Batch Attendance Breakdown
Retrieves all lectures in a batch with the student's individual attendance status and percentage.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/student/batchAttendance`
- **Auth**: Required (`admin`, `professor`, `student`, `super_admin`)
- **Query Parameters**:
  - `batch_id` (string, required): UUID of the `Batch`.
  - `student_id` (string, optional for student role, required for others): `StudentDetail.id`.

#### Prisma Select Clause
```
batch.findUnique({ select: {
  name,
  lectures: {
    orderBy: { created_at: 'desc' },
    include: {
      attendance: { where: { student_id }, select: { count } },
      professor: { select: { full_name } }
    }
  }
} })
```

#### Access Checks
- `student`: Must be enrolled in `batch_id` via `isStudentEnrolledInBatch()`.
- `professor`: Must be assigned to `batch_id` via `isProfessorAssignedToBatch()`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "result": [
    {
      "lecture_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "lecture_mode": "offline",
      "professor_name": "Prof. S. K. Verma",
      "attendance_toggle": false,
      "attended_count": 3,
      "total_count": 3,
      "percentage": 100,
      "created_at": "2026-03-23T10:00:00.000Z"
    }
  ]
}
```

#### Error Responses
- `400 Bad Request`: `{ "success": false, "message": "batch_id required", "error": null }`
- `403 Forbidden` (student not enrolled): `{ "success": false, "message": "Forbidden: not enrolled in this batch", "error": null }`
- `403 Forbidden` (professor not assigned): `{ "success": false, "message": "Forbidden: not assigned to this batch", "error": null }`
- `404 Not Found`: `{ "success": false, "message": "Batch not found", "error": null }`
