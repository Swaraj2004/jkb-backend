# Subject & Student Subject-Package Mapping API Documentation

- **Route Source**: [src/routes/subjectRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/subjectRoutes.ts)
- **Controller Source**: [src/controllers/subjectController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/subjectController.ts)
- **Mount Point**: `/api/v3/admin` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L66)
- **Primary Database Models**: `Subject`, `SubjectProfessor`, `PackageSubject`, `StudentSubject`, `StudentPackage`, `StudentDetail`, `Fee`, `User`

---

## 🎯 Overview & Purpose

The Subject Management module handles standalone subject definitions, tuition fees, faculty assignments via `SubjectProfessor`, student subject/package enrollment mappings, and automatic recalculation of student fees.

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Get All Subjects | `GET` | `/api/v3/admin/subjects` | No | Public |
| Get Subject by ID | `GET` | `/api/v3/admin/subjects/:subject_id` | No | Public |
| Get Subject Enrolled Users | `GET` | `/api/v3/admin/subject-users` | Yes | `admin`, `super_admin` |
| Get Student Subjects | `GET` | `/api/v3/admin/student-subjects/:student_id` | Yes | `admin`, `student`, `super_admin` |
| Create Subject | `POST` | `/api/v3/admin/subjects` | Yes | `admin`, `super_admin` |
| Update Subject | `PUT` | `/api/v3/admin/subjects` | Yes | `admin`, `super_admin` |
| Delete Subject | `DELETE` | `/api/v3/admin/subjects/:subject_id` | Yes | `admin`, `super_admin` |
| Sync Student Subject & Packages | `PUT` | `/api/v3/admin/subject-package` | Yes | `admin`, `super_admin` |

---

## 📡 Endpoint Specifications

### 1. Get All Subjects
Uses `include: { subjectProfessors: { select: { professor: { select: { id, full_name } } } } }`. Returns the **full `Subject` model** plus the professor nested list.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/subjects`
- **Auth**: None (Public)

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
      "updated_at": null,
      "subjectProfessors": [
        {
          "professor": {
            "id": "f5127025-a128-4f27-a066-70e0f31be4db",
            "full_name": "Prof. S. K. Verma"
          }
        }
      ]
    }
  ]
}
```

---

### 2. Get Subject by ID
Same shape as Get All Subjects but single record. Uses `include: { subjectProfessors: { select: { professor: { select: { id, full_name } } } } }`.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/subjects/:subject_id`

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Subject fetched successfully",
  "result": {
    "id": "3d9c9099-b131-419b-a36c-9418e5e8e811",
    "name": "Applied Mathematics IV",
    "subject_fees": "6000",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": null,
    "subjectProfessors": [
      {
        "professor": {
          "id": "f5127025-a128-4f27-a066-70e0f31be4db",
          "full_name": "Prof. S. K. Verma"
        }
      }
    ]
  }
}
```

#### Error Responses
- `404 Not Found`: `{ "success": false, "message": "Subject not found", "error": null }`

---

### 3. Create a Subject
Creates a `Subject` and maps multiple professor user IDs via `SubjectProfessor` inside a `$transaction`. Returns the new `subject.id`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/admin/subjects`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "name": "Design & Analysis of Algorithms",
  "subject_fees": 7500,
  "professor_user_ids": [
    "f5127025-a128-4f27-a066-70e0f31be4db"
  ]
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Subject created successfully",
  "result": "9a01c345-d221-46ab-89c0-ea7b4f591234"
}
```
- **Error (400 Bad Request)**: `{ "success": false, "message": "Name and Subject Fees are required", "error": null }`

---

### 4. Update a Subject
Updates `name` and `subject_fees`. Deletes all existing `SubjectProfessor` rows and recreates them.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/admin/subjects`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body** (must include `id`):
```json
{
  "id": "9a01c345-d221-46ab-89c0-ea7b4f591234",
  "name": "Algorithms & Complexity",
  "subject_fees": 8000,
  "professor_user_ids": [
    "f5127025-a128-4f27-a066-70e0f31be4db"
  ]
}
```
- **Response (200 OK)**: `{ "success": true, "message": "Subject updated successfully", "result": 1 }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "ID, Name, and Subject Fees are required", "error": null }`

---

### 5. Delete a Subject
Cascades deletion of `SubjectProfessor`, `PackageSubject`, `StudentSubject`.

- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/admin/subjects/:subject_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Response (200 OK)**: `{ "success": true, "message": "Subject deleted successfully", "result": 1 }`

---

### 6. Get Users Enrolled in a Subject (`/subject-users`)
Retrieves all users enrolled in a subject either via `StudentSubject` or via a `StudentPackage` whose package contains the subject in `PackageSubject`.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/subject-users`
- **Auth**: Required (`admin`, `super_admin`)
- **Query Parameters**:
  - `subject_id` (string, required)
  - `year` (integer, optional): e.g. `2026`

#### Prisma Select Clause (with year)
```typescript
select: {
  email, full_name, phone, location, id, lastlogin, created_at,
  studentDetail: {
    include: {
      fees: { orderBy: { year: 'desc' }, take: 1 },
      studentPackages: true,   // full StudentPackage rows
      studentSubjects: true    // full StudentSubject rows
    }
  },
  userRole: { select: { role: { select: { id, name } } } }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Subject users fetched successfully",
  "result": [
    {
      "id": "8488e001-c887-4eb7-86c0-7612d9198642",
      "email": "rohan@gmail.com",
      "full_name": "Rohan Sharma",
      "phone": "9820012345",
      "location": "Mumbai",
      "lastlogin": "2026-03-23T14:35:10.000Z",
      "created_at": "2026-01-15T08:30:00.000Z",
      "studentDetail": {
        "id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
        "user_id": "8488e001-c887-4eb7-86c0-7612d9198642",
        "parent_contact": "9820098200",
        "branch_id": "e3053702-cce7-4581-81fe-0a377034b791",
        "diploma_score": null,
        "xii_score": 88.5,
        "cet_score": 96.2,
        "jee_score": 91.4,
        "college_name": "VJTI Mumbai",
        "referred_by": null,
        "student_fees": "25000",
        "total_fees": "25000",
        "pending_fees": "10000",
        "university_name": "Mumbai University",
        "jkb_centre": "Dadar",
        "semester": "Sem 3",
        "status": "Active",
        "remark": null,
        "enrolled": true,
        "created_at": "2026-01-15T08:30:00.000Z",
        "updated_at": "2026-03-01T12:00:00.000Z",
        "fees": [
          {
            "id": "e87f3b89-21a4-406b-9c3f-42e88a08ef41",
            "student_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
            "student_fees": "25000",
            "total_fees": "25000",
            "year": 2026,
            "created_at": "2026-01-15T08:30:00.000Z",
            "updated_at": null
          }
        ],
        "studentPackages": [
          {
            "student_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
            "package_id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
            "year": 2026,
            "created_at": "2026-01-15T08:30:00.000Z"
          }
        ],
        "studentSubjects": [
          {
            "student_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
            "subject_id": "3d9c9099-b131-419b-a36c-9418e5e8e811",
            "year": 2026,
            "created_at": "2026-01-15T08:30:00.000Z"
          }
        ]
      },
      "userRole": [
        {
          "role": {
            "id": "a11979b9-d2b3-46fa-a832-6bf797621c83",
            "name": "student"
          }
        }
      ]
    }
  ]
}
```

---

### 7. Get Student Subjects (`GET /student-subjects/:student_id`)
Returns full `Subject` rows for a student by querying `Subject.studentSubjects.some({ student_id })`. Uses no `select` — returns full `Subject` model.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/student-subjects/:student_id`
- **Auth**: Required (`admin`, `student`, `super_admin`)
- **Path Parameters**: `student_id` (string, required): `StudentDetail.id`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Student subjects fetched successfully",
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

### 8. Sync Student Subject & Package Enrollments (`PUT /subject-package`)
Batch-updates student enrollments for the given year and recalculates fees.

> [!IMPORTANT]
> Setting `student_fees = 0` is **intentional** when packages/subjects are synced. The admin must separately call `PUT /api/v3/admin/student-fees` to set a discounted fee.

> [!WARNING]
> If any payment exists for the student in that year, the update is blocked: `"Student has a payment related to it in this year."` Returns HTTP 500 (`UPDATE_FAILURE`).

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/admin/subject-package`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body** (array of entries):
```json
[
  {
    "student_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
    "year": 2026,
    "package_ids": [
      "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5"
    ],
    "subject_ids": [
      "3d9c9099-b131-419b-a36c-9418e5e8e811"
    ]
  }
]
```

#### Business Logic Steps (per item)
1. Verifies `StudentDetail` exists by `id`.
2. Checks if any payment exists for that year → block if yes.
3. Calculates new `totalAmount` via `getTotalAmout()`.
4. Deletes `StudentPackage` and `StudentSubject` rows for `(student_id, year)`.
5. Creates new `StudentPackage` and `StudentSubject` rows.
6. Upserts `Fee` record setting `total_fees = totalAmount`, `student_fees = 0`.
7. Updates `StudentDetail.total_fees = totalAmount`, `student_fees = 0`.

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Student Subject & Packages created successfully!",
  "result": 1
}
```

#### Error Responses
- `400 Bad Request`: `{ "success": false, "message": "Request body must be a non-empty array", "error": null }`
- `400 Bad Request`: `{ "success": false, "message": "Student Detail with given student_id does not exist!", "error": null }`
- `500 Update Failure`: `{ "success": false, "message": "Student has a payment related to it in this year.", "error": null }`
- `500 Create Failure`: `{ "success": false, "message": "Failed to create Student Subject & Packages", "error": null }`
