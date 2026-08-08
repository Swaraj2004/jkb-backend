# Course Package & Academic Administration API Documentation

- **Route Source**: [src/routes/coursePackageRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/coursePackageRoutes.ts)
- **Controller Source**: [src/controllers/coursePackageController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/coursePackageController.ts)
- **Mount Point**: `/api/v3/admin` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L59)
- **Primary Database Models**: `Package`, `PackageSubject`, `Subject`, `StudentPackage`, `StudentDetail`, `User`, `Batch`, `BatchProfessor`, `StudentBatch`, `Lecture`, `Attendance`

---

## 🎯 Overview & Purpose

The Course Package module manages bundled academic subjects (e.g. *Semester 3 Package*, *GATE Prep Bundle*), student package enrollments, and academic batch rosters with deep attendance metrics. It enables administrators to create bundled packages, price them, attach subjects via `PackageSubject`, query enrolled students, and view batch-wide lecture attendance records.

---

## 🗄 Prisma Data Models & Relationships

```prisma
model Package {
  id           String    @id @default(uuid()) @db.Uuid
  package_name String
  package_fees Decimal
  created_at   DateTime  @default(now()) @db.Timestamptz()
  updated_at   DateTime? @updatedAt @db.Timestamptz()

  packageSubjects PackageSubject[]
  studentPackages StudentPackage[]
  packagePayments PackagePayment[]
}

model PackageSubject {
  package_id String   @db.Uuid
  subject_id String   @db.Uuid
  created_at DateTime @default(now()) @db.Timestamptz()

  package Package @relation(fields: [package_id], references: [id], onDelete: Cascade)
  subject Subject @relation(fields: [subject_id], references: [id], onDelete: Cascade)

  @@id([package_id, subject_id])
}
```

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Get Package by ID | `GET` | `/api/v3/admin/packages/:package_id` | No | Public |
| Get All Packages | `GET` | `/api/v3/admin/packages` | No | Public (supports `?type=alternative`) |
| Get Package Enrolled Users | `GET` | `/api/v3/admin/package-users` | Yes | `admin`, `super_admin` |
| Get Student Enrolled Packages | `GET` | `/api/v3/admin/student-packages/:student_id` | Yes | `admin`, `professor`, `student`, `super_admin` |
| Create Course Package | `POST` | `/api/v3/admin/packages` | Yes | `admin`, `super_admin` |
| Update Course Package | `PUT` | `/api/v3/admin/packages` | Yes | `admin`, `super_admin` |
| Delete Course Package | `DELETE` | `/api/v3/admin/packages/:package_id` | Yes | `admin`, `super_admin` |
| Get All Professors | `GET` | `/api/v3/admin/professors` | Yes | `admin`, `super_admin` |
| Get All Batches | `GET` | `/api/v3/admin/batches` | Yes | `admin`, `super_admin` |
| Get Batch Deep Roster Details | `GET` | `/api/v3/admin/batchDetails/:batch_id` | Yes | `admin`, `super_admin` |

---

## 📡 Endpoint Details

### 1. Get All Course Packages
Returns all packages. When `?type=alternative` is passed, returns a lightweight list containing only `id` and `package_name`. Otherwise, includes nested subject information via `packageSubjects → subject`.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/packages`
- **Query Parameters**:
  - `type` (string, optional): Pass `'alternative'` to return only `{ id, package_name }`.

#### Standard Response (200 OK) — Full (no `type` query)
The controller uses `include: { packageSubjects: { select: { subject: true } } }`, which returns the **full `Subject` model**.

```json
{
  "success": true,
  "message": "Course Packages Fetched Successfully!",
  "result": [
    {
      "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
      "package_name": "Full Semester 4 Engineering Bundle",
      "package_fees": "25000",
      "created_at": "2026-01-10T09:00:00.000Z",
      "updated_at": null,
      "packageSubjects": [
        {
          "subject": {
            "id": "d09a25b1-1ec8-490d-95cf-94578b8849b2",
            "name": "Applied Mathematics IV",
            "subject_fees": "6000",
            "created_at": "2026-01-01T00:00:00.000Z",
            "updated_at": null
          }
        }
      ]
    }
  ]
}
```

#### Alternative Response (200 OK) — `?type=alternative`
Uses `select: { id: true, package_name: true }`.
```json
{
  "success": true,
  "message": "Course Packages Fetched Successfully!",
  "result": [
    {
      "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
      "package_name": "Full Semester 4 Engineering Bundle"
    }
  ]
}
```

---

### 2. Get Course Package by ID
Uses `prismaClient.package.findUnique({ where: { id } })` — returns the **full `Package` model** with no nested relations.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/packages/:package_id`
- **Path Parameters**: `package_id` (string, required)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Course Package Fetched Successfully!",
  "result": {
    "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
    "package_name": "Full Semester 4 Engineering Bundle",
    "package_fees": "25000",
    "created_at": "2026-01-10T09:00:00.000Z",
    "updated_at": null
  }
}
```

#### Error Responses
- `404 Not Found`: `{ "success": false, "message": "Course package not found", "error": null }`

---

### 3. Create Course Package
Creates a new course package and associates multiple subjects via `PackageSubject`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/admin/packages`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "package_name": "GATE Computer Science 2026",
  "package_fees": 30000,
  "subjects": [
    "d09a25b1-1ec8-490d-95cf-94578b8849b2",
    "f29a25b1-2ec8-490d-95cf-94578b8849b3"
  ]
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "CoursePackage created successfully!",
  "result": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5"
}
```
- **Error (500 Create Failure)**: `{ "success": false, "message": "Failed to Create Package", "error": null }`

---

### 4. Update Course Package
Updates package name, fees, and syncs subject associations (delete + recreate `PackageSubject`).

> [!WARNING]
> Per the code comment, `total_fees` and `student_fees` in `StudentDetail` are NOT automatically updated when a package changes its price. This is a known limitation.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/admin/packages`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
  "package_name": "GATE Computer Science 2026 (Updated)",
  "package_fees": 32000,
  "subjects": [
    "d09a25b1-1ec8-490d-95cf-94578b8849b2"
  ]
}
```
- **Response (200 OK)**: `{ "success": true, "message": "CoursePackage Updated Successfully!", "result": 1 }`
- **Error (400 Bad Request)**: `{ "success": true, "message": "Course package id is required", "error": null }` *(note: controller returns `UPDATE_SUCCESS` code, not `BAD_REQUEST`, for missing id — this is a bug in the controller)*

---

### 5. Delete Course Package
- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/admin/packages/:package_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Response (200 OK)**: `{ "success": true, "message": "CoursePackage deleted Successfully!", "result": 1 }`

---

### 6. Get Users Enrolled in a Package (`/package-users`)
Returns all users where their `StudentDetail` has a `StudentPackage` matching the given `package_id`.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/package-users`
- **Auth**: Required (`admin`, `super_admin`)
- **Query Parameters**:
  - `subject_package_id` (string, required): UUID of the `Package`.
  - `year` (integer, optional): Filter by enrollment year, e.g. `2026`.

#### Prisma Select Clause
```typescript
select: {
  email, full_name, phone, location, id, lastlogin, created_at,
  studentDetail: {
    include: {
      branch: true,
      fees: { orderBy: { year: 'desc' }, take: 1 },
      studentPackages: { select: { package: true } },
      studentSubjects: { select: { subject: true } }
    }
  },
  userRole: { select: { role: { select: { id, name } } } }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Record fetched successfully",
  "result": [
    {
      "id": "8488e001-c887-4eb7-86c0-7612d9198642",
      "email": "rohan@gmail.com",
      "full_name": "Rohan Sharma",
      "phone": "9820012345",
      "location": "Mumbai",
      "lastlogin": "2026-03-20T10:00:00.000Z",
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
        "branch": {
          "id": "e3053702-cce7-4581-81fe-0a377034b791",
          "name": "Computer Science & Engineering",
          "created_at": "2026-01-01T00:00:00.000Z",
          "updated_at": null
        },
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
            "package": {
              "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
              "package_name": "GATE Computer Science 2026",
              "package_fees": "30000",
              "created_at": "2026-01-10T09:00:00.000Z",
              "updated_at": null
            }
          }
        ],
        "studentSubjects": [
          {
            "subject": {
              "id": "d09a25b1-1ec8-490d-95cf-94578b8849b2",
              "name": "Applied Mathematics IV",
              "subject_fees": "6000",
              "created_at": "2026-01-01T00:00:00.000Z",
              "updated_at": null
            }
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

### 7. Get Packages for a Student (`/student-packages/:student_id`)
Uses `findUnique({ where: { user_id: student_id }, include: { studentPackages: { include: { package: true } } } })`. Filters out null packages.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/student-packages/:student_id`
- **Auth**: Required (`admin`, `professor`, `student`, `super_admin`)
- **Path Parameters**: `student_id` (string, required): `User.id`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Record fetched successfully",
  "result": [
    {
      "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
      "package_name": "GATE Computer Science 2026",
      "package_fees": "30000",
      "created_at": "2026-01-10T09:00:00.000Z",
      "updated_at": null
    }
  ]
}
```

---

### 8. Get All Professors (`/professors`)
Uses `select: { email, full_name, phone, location, id, lastlogin, created_at }` — no `password`, no `studentDetail`.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/professors`
- **Auth**: Required (`admin`, `super_admin`)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Professors Fetched Successfully!",
  "result": [
    {
      "id": "f5127025-a128-4f27-a066-70e0f31be4db",
      "full_name": "Prof. S. K. Verma",
      "email": "skverma@jkb.edu",
      "phone": "9876543210",
      "location": "Mumbai",
      "lastlogin": "2026-03-20T10:00:00.000Z",
      "created_at": "2026-01-15T08:30:00.000Z"
    }
  ]
}
```

---

### 9. Get All Batches (`/batches`)
Uses `prismaClient.batch.findMany()` — returns the **full `Batch` model** (no nested relations).

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/batches`
- **Auth**: Required (`admin`, `super_admin`)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Batches Fetched Successfully!",
  "result": [
    {
      "id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
      "subject_id": "3d9c9099-b131-419b-a36c-9418e5e8e811",
      "name": "Batch A - Mathematics 2026",
      "created_at": "2026-01-20T09:00:00.000Z"
    }
  ]
}
```

---

### 10. Get Batch Roster & Attendance Matrix (`/batchDetails/:batch_id`)
Returns a combined result of `batch.findUnique` and `lecture.findMany` with zero-padding for missing attendance.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/batchDetails/:batch_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Path Parameters**: `batch_id` (string, required)

#### Prisma Select Clause (batch query)
```typescript
select: {
  name, id,
  batchProfessors: { select: { professor: { select: { id, full_name } } } },
  studentBatches: {
    select: {
      student: {
        select: {
          id,
          user: { select: { full_name } },
          attendance: {
            where: { lecture: { batch_id } },
            select: {
              count,
              lecture: { select: { id, remark, total_count } }
            }
          }
        }
      },
      batch: { select: { id, name } }
    }
  }
}
```

Lecture query selects `{ id, remark, total_count }` and zero-pads any missing entries into each student's `attendance` array.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Batches Fetched Successfully!",
  "result": {
    "id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
    "name": "Batch A - Mathematics 2026",
    "batchProfessors": [
      {
        "professor": {
          "id": "f5127025-a128-4f27-a066-70e0f31be4db",
          "full_name": "Prof. S. K. Verma"
        }
      }
    ],
    "studentBatches": [
      {
        "batch": {
          "id": "7b049d50-9d0a-4fb4-81ef-2a075306dc90",
          "name": "Batch A - Mathematics 2026"
        },
        "student": {
          "id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
          "user": {
            "full_name": "Rohan Sharma"
          },
          "attendance": [
            {
              "count": 1,
              "lecture": {
                "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
                "remark": "Topic: Dynamic Programming",
                "total_count": 1
              }
            },
            {
              "count": 0,
              "lecture": {
                "id": "e390f1ee-7c54-5b01-91f1-e801748f0852",
                "remark": "Topic: Graph Algorithms",
                "total_count": 1
              }
            }
          ]
        }
      }
    ]
  }
}
```
