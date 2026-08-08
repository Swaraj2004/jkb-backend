# Professor, Batch & Lecture Management API Documentation

- **Route Source**: [src/routes/professorRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/professorRoutes.ts)
- **Controller Source**: [src/controllers/professorController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/professorController.ts) & [src/controllers/batchController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/batchController.ts)
- **Mount Point**: `/api/v3/professor` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L63)
- **Primary Database Models**: `Lecture`, `Batch`, `BatchProfessor`, `SubjectProfessor`, `Subject`, `StudentBatch`, `User`

---

## 🎯 Overview & Purpose

The Professor Management module provides lecture scheduling, attendance toggle administration, faculty subject assignments, batch management, and student batch rosters. It features strict role-based ownership validation to prevent professors from modifying lectures or batches assigned to other instructors.

---

## 🔐 Access Control & Security Rules

1. **Professor Scope Isolation**:
   - `POST /professor/lectures`: If the caller is a `professor`, enforces `professor_id === req.user.user_id` and verifies a `BatchProfessor` assignment exists.
   - `PUT /professor/lectures`: Professor can only toggle their own lectures (`Lecture.professor_id === req.user.user_id`).
2. **Admin Authority**:
   - `admin` and `super_admin` can create batches, assign professors, delete batches, and manage any lecture.

---

## 📡 Endpoint Specifications

### 1. Get Professor Subjects (`GET /subjects`)
Uses `prismaClient.subject.findMany({ where: { subjectProfessors: { some: { professor_id } } } })` — returns full `Subject` model rows with **no nested relations**.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/professor/subjects`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Query Parameters**: `professor_id` (string, required)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Subjects fetched successfully",
  "result": [
    {
      "id": "3d9c9099-b131-419b-a36c-9418e5e8e811",
      "name": "Applied Mathematics IV",
      "subject_fees": "6000",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": null
    }
  ]
}
```

---

### 2. Get Professor Lectures (`GET /lectures`)
Uses `prismaClient.lecture.findMany({ where: { professor_id } })` — returns full `Lecture` model rows with **no nested relations**.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/professor/lectures`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Query Parameters**: `professor_id` (string, required)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Lectures fetched successfully",
  "result": [
    {
      "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
      "professor_id": "f5127025-a128-4f27-a066-70e0f31be4db",
      "batch_id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
      "lecture_mode": "offline",
      "total_count": 3,
      "remark": "Topic: Dynamic Programming",
      "attendance_toggle": false,
      "created_at": "2026-03-15T10:00:00.000Z",
      "updated_at": "2026-03-15T12:00:00.000Z"
    }
  ]
}
```

---

### 3. Create a New Lecture (`POST /lectures`)
Creates a `Lecture` and returns `newLecture.id`. `attendance_toggle` defaults to `true`; if true, `total_count` initializes to `1`, otherwise `0`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/professor/lectures`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Request Body**:
```json
{
  "professor_id": "f5127025-a128-4f27-a066-70e0f31be4db",
  "batch_id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
  "lecture_mode": "offline",
  "remark": "Topic: Dynamic Programming",
  "attendance_toggle": true
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Lecture created successfully",
  "result": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```
- **Error (400 Bad Request)**: `{ "success": false, "message": "Missing required fields: professor_id, batch_id, lecture_mode", "error": null }`
- **Error (403 Forbidden)**: `{ "success": false, "message": "Forbidden: cannot create lecture for others", "error": null }`
- **Error (403 Forbidden)**: `{ "success": false, "message": "Forbidden: professor is not assigned to this batch", "error": null }`

---

### 4. Update Lecture / Attendance Toggle (`PUT /lectures`)
Toggles `attendance_toggle`. If set to `true`, increments `total_count: { increment: 1 }`. Returns `updated.id` (from `select: { id, attendance_toggle, total_count }`).

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/professor/lectures`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Request Body**:
```json
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "attendance_toggle": false
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Lecture updated successfully",
  "result": "d290f1ee-6c54-4b01-90e6-d701748f0851"
}
```
- **Error (400 Bad Request)**: `{ "success": false, "message": "Lecture ID is required", "error": null }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "attendance_toggle must be true or false", "error": null }`
- **Error (403 Forbidden)**: `{ "success": false, "message": "Forbidden: lecture does not belong to you", "error": null }`

---

### 5. Delete Lecture (`DELETE /lectures/:lecture_id`)
Cascades deletion of `Attendance` records for this lecture.

- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/professor/lectures/:lecture_id`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Response (200 OK)**: `{ "success": true, "message": "Lecture deleted successfully", "result": 1 }`

---

### 6. Get Batch Lectures (`GET /batch-lectures`)
Returns batch details and its lectures, including professor name per lecture.

#### Prisma Select Clause
```typescript
prismaClient.batch.findMany({
  where: { id: batchId },
  select: {
    id,
    lectures: {
      select: {
        id, lecture_mode, attendance_toggle,
        professor: { select: { full_name: true } }
      }
    }
  }
})
```

- **HTTP Method**: `GET`
- **Path**: `/api/v3/professor/batch-lectures` (or via query param)
- **Query Parameters**: `batch_id` (string, required)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Batch Lectures fetched successfully",
  "result": [
    {
      "id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
      "lectures": [
        {
          "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
          "lecture_mode": "offline",
          "attendance_toggle": false,
          "professor": {
            "full_name": "Prof. S. K. Verma"
          }
        }
      ]
    }
  ]
}
```

---

### 7. Get Professor Batches (`GET /batches`)
Returns all batches assigned to a professor.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/professor/batches`
- **Auth**: Required (`admin`, `professor`, `super_admin`)
- **Query Parameters**: `professor_id` (string, required)

---

### 8. Create Batch (`POST /batches`)
Creates a new batch. Returns the full newly created `Batch` object.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/professor/batches`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "subject_id": "3d9c9099-b131-419b-a36c-9418e5e8e811",
  "name": "Batch B - Algorithms 2026"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Batch created successfully",
  "result": {
    "id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
    "subject_id": "3d9c9099-b131-419b-a36c-9418e5e8e811",
    "name": "Batch B - Algorithms 2026",
    "created_at": "2026-03-01T09:00:00.000Z"
  }
}
```

---

### 9. Update Batch (`PUT /batches`)
Updates batch name, student enrollments (`StudentBatch`), and professor assignments (`BatchProfessor`) in a Prisma transaction.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/professor/batches`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "batch_id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
  "name": "Batch B - Algorithms 2026 (Updated)",
  "student_ids": [
    "90e0c034-7123-49aa-9ef1-5a0248bf9199"
  ],
  "professor_ids": [
    "f5127025-a128-4f27-a066-70e0f31be4db"
  ]
}
```

#### Transaction Steps
1. Updates batch `name` if provided.
2. If `student_ids`: deletes existing `StudentBatch` rows for this batch, then recreates.
3. If `professor_ids`: deletes existing `BatchProfessor` rows, then recreates.

- **Response (200 OK)**: `{ "success": true, "message": "Batch updated successfully", "result": 1 }`

---

### 10. Delete Batch (`DELETE /batches`)
Cascades deletion of `BatchProfessor`, `StudentBatch`, and `Lecture` (which cascades to `Attendance`).

- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/professor/batches`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**: `{ "batch_id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90" }`
- **Response (200 OK)**: `{ "success": true, "message": "Batch deleted successfully", "result": 1 }`
