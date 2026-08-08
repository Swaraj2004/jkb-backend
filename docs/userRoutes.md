# User Account & Student Registration API Documentation

- **Route Source**: [src/routes/userRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/userRoutes.ts)
- **Controller Source**: [src/controllers/userController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/userController.ts)
- **Mount Point**: `/api/v3/auth/users` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L68)
- **Primary Database Models**: `User`, `UserRole`, `Role`, `StudentDetail`, `Fee`, `StudentSubject`, `StudentPackage`, `Subject`, `Package`
- **Audit Logging**: Logs `USER_CREATED` and `USER_DELETED` via [logger_helper.ts](file:///c:/Users/user/Desktop/jkb-backend/src/logging/logger_helper.ts).

---

## 🎯 Overview & Purpose

The User Management module manages user accounts (students, professors, administrators), password hashing with bcrypt, combined student-plus-profile atomic registrations, academic year-filtered user queries, profile updates, and Winston audit trails.

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Get User by ID | `GET` | `/api/v3/auth/users/:user_id` | Yes | `admin`, `professor`, `student` (own ID only), `super_admin` |
| Get All Users (Year Filter) | `GET` | `/api/v3/auth/users` | Yes | `admin`, `super_admin` |
| Create Staff/Admin User | `POST` | `/api/v3/auth/users` | Yes | `admin`, `super_admin` |
| Self-Register Student Account | `POST` | `/api/v3/auth/users/student` | No (Public) | Anyone |
| Atomic Full Student Registration | `POST` | `/api/v3/auth/users/students` | No (Public) | Anyone |
| Update User Profile | `PUT` | `/api/v3/auth/users` | Yes | `admin`, `super_admin` |
| Delete User Account | `DELETE` | `/api/v3/auth/users/:user_id` | Yes | `admin`, `super_admin` |

---

## 📡 Endpoint Specifications

### 1. Get User Profile by ID (`GET /:user_id`)
Fetches the user profile with role, student detail, branch, fee history, enrolled packages, and subjects.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/auth/users/:user_id`
- **Auth**: Required — students can only view their own profile.

#### Prisma Select Clause
```typescript
prismaClient.user.findUnique({
  where: { id },
  select: {
    email, full_name, phone, location, id, lastlogin, created_at,
    studentDetail: {
      include: {
        branch: true,
        fees: {
          select: {
            id, student_fees, total_fees, year,
            payments: {
              orderBy: { created_at: 'asc' },
              select: {
                id, fee_id, receipt_number, amount, mode, status,
                is_gst, user_id, remark, created_by, created_at
                // Note: 'pending' is commented out in the source
              }
            }
          }
        },
        studentPackages: { select: { package: true, year: true } },
        studentSubjects: { select: { subject: true, year: true } }
      }
    },
    userRole: { select: { role: { select: { id, name } } } }
  }
})
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "result": {
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
      "branch": {
        "id": "e3053702-cce7-4581-81fe-0a377034b791",
        "name": "Computer Science & Engineering",
        "created_at": "2026-01-01T00:00:00.000Z",
        "updated_at": null
      },
      "fees": [
        {
          "id": "e87f3b89-21a4-406b-9c3f-42e88a08ef41",
          "student_fees": "25000",
          "total_fees": "25000",
          "year": 2026,
          "payments": [
            {
              "id": "a90e3845-f09b-4328-89c0-ec7b4f590011",
              "fee_id": "e87f3b89-21a4-406b-9c3f-42e88a08ef41",
              "receipt_number": "G2025260001",
              "amount": "15000",
              "mode": "NEFT",
              "status": "Completed",
              "is_gst": true,
              "user_id": "8488e001-c887-4eb7-86c0-7612d9198642",
              "remark": null,
              "created_by": "f5127025-a128-4f27-a066-70e0f31be4db",
              "created_at": "2026-02-10T11:20:00.000Z"
            }
          ]
        }
      ],
      "studentPackages": [
        {
          "year": 2026,
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
          "year": 2026,
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
}
```

---

### 2. Get All Users with Optional Academic Year Filtering (`GET /`)
Returns all users. If `?year=2026`, students are filtered by financial year (`April 15th, year` to `April 15th, year+1`), but non-students (professors, admins) always appear.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/auth/users`
- **Auth**: Required (`admin`, `super_admin`)
- **Query Parameters**: `year` (string, optional): e.g. `?year=2026`.

#### Prisma Select Clause (with year filter)
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
  "message": "Users fetched successfully",
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
              "package_name": "GATE CS 2026",
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

### 3. Create Staff / Admin User (`POST /`)
Creates a new user account with a specified role. Uses `select: { id: true, email: true }` for the response.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/users`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "full_name": "Prof. S. K. Verma",
  "email": "skverma@jkb.edu",
  "phone": "9876543210",
  "password": "Password123",
  "location": "Mumbai",
  "role_id": "f29079b9-d2b3-46fa-a832-6bf797621c84"
}
```
- **Response (201 Created)**: `{ "success": true, "message": "Record inserted Successfully", "result": "user_uuid" }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "Cannot create a new Super Admin", "error": null }`
- **Error (500 Create Failure)**: `{ "success": false, "message": "User role not found", "error": null }`

---

### 4. Self-Register Basic Student Account (`POST /student`)
Public registration for a student user account. Auto-assigns `student` role. Returns full `User` object (including `password` hash — do not expose to client).

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/users/student`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "full_name": "Aum Patel",
  "email": "aum@gmail.com",
  "phone": "9819001234",
  "password": "SecretPassword123",
  "location": "Thane"
}
```
- **Response (201 Created)**: `{ "success": true, "message": "Record inserted Successfully", "result": "new_user_uuid" }`

---

### 5. Atomic Full Student Registration (`POST /students`)
Creates `User`, assigns `student` role, creates `StudentDetail`, `StudentPackage`, `StudentSubject`, and `Fee` records in one Prisma nested write.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/users/students`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "full_name": "Pooja Deshmukh",
  "email": "pooja.d@gmail.com",
  "phone": "9820123456",
  "password": "Password2026",
  "location": "Pune",
  "studentDetail": {
    "parent_contact": "9820123450",
    "branch_id": "e3053702-cce7-4581-81fe-0a377034b791",
    "diploma_score": null,
    "xii_score": 92.4,
    "cet_score": 98.1,
    "jee_score": 94.0,
    "college_name": "COEP Pune",
    "referred_by": "Alumni",
    "university_name": "SPPU",
    "jkb_centre": "Pune Camp",
    "semester": "Sem 3",
    "status": "Admitted",
    "remark": null,
    "enrolled": false,
    "packages": ["c1f7a08b-0361-4df2-a3eb-b8c7e997fce5"],
    "subjects": ["3d9c9099-b131-419b-a36c-9418e5e8e811"],
    "fee_year": 2026
  }
}
```
- **Response (201 Created)**: `{ "success": true, "message": "Record inserted Successfully", "result": "new_user_uuid" }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "studentDetail is required", "error": null }`

---

### 6. Update User Profile (`PUT /`)
Updates user fields. Password is re-hashed if provided. Fields `id`, `created_at`, `updated_at` are excluded from the update.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/auth/users`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body** (include `id` or `email` to identify):
```json
{
  "id": "8488e001-c887-4eb7-86c0-7612d9198642",
  "full_name": "Rohan A. Sharma",
  "phone": "9820099999",
  "location": "Navi Mumbai"
}
```
- **Response (200 OK)**: `{ "success": true, "message": "Record Updated Successfully", "result": 1 }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "User identifier missing", "error": "Provide either ID or Email" }`

---

### 7. Delete User Account (`DELETE /:user_id`)
Deletes user and logs `USER_DELETED` audit event with IP address.

- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/auth/users/:user_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Response (200 OK)**: `{ "success": true, "message": "Record deleted Successfully", "result": 1 }`
- **Error (500 Delete Failure)**: `{ "success": false, "message": "Failed to delete user", "error": null }`
