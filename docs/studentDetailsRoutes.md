# Student Profile & Academic Details Management API Documentation

- **Route Source**: [src/routes/studentDetailsRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/studentDetailsRoutes.ts)
- **Controller Source**: [src/controllers/studentDetailsController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/studentDetailsController.ts)
- **Mount Point**: `/api/v3/student-details` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L65)
- **Primary Database Models**: `StudentDetail`, `User`, `Branch`, `Fee`, `StudentSubject`, `StudentPackage`, `Subject`, `Package`

---

## 🎯 Overview & Academic Profile Architecture

The Student Details module manages student profiles including competitive test entrance scores (Diploma, XII, MHT-CET, JEE), parent contact information, college affiliation, academic semester, tuition fee calculations based on chosen subjects/packages, and academic year tracking.

---

## 🔐 Access Control & Security Rules

1. **Student Self-Access Only**:
   - When calling `GET /api/v3/student-details/:student_id`, if `req.user.role_name === 'student'`, the route enforces `student_id === req.user.user_id`. Attempting to view another student's profile returns `401 Unauthorized`.
2. **Fee Tampering Prevention**:
   - In `PUT /api/v3/student-details`, students (`STUDENT_ROLE`) cannot modify `student_fees`. If `student_fees > 0` is present in the body for a student, returns `400 Bad Request`: `"Student can't edit student_fees!"`.

---

## 📡 Endpoint Specifications

### 1. Get Student Profile by User ID (`GET /:student_id`)
Uses `prismaClient.studentDetail.findUnique({ where: { user_id: studentId } })` — returns the **complete `StudentDetail` row** with **no nested relations**.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/student-details/:student_id`
- **Auth**: Required (`admin`, `professor`, `student`, `super_admin`)
- **Path Parameters**: `student_id` (string, required): `User.id` (UUID).

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Record fetched successfully",
  "result": {
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
    "updated_at": "2026-03-01T12:00:00.000Z"
  }
}
```

#### Error Responses
- `404 Not Found`: `{ "success": false, "message": "Student record not found", "error": null }`

---

### 2. Get All Student Details (`GET /`)
Uses `prismaClient.studentDetail.findMany()` — returns a flat array of **complete `StudentDetail` rows** with no nested relations.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/student-details`
- **Auth**: Required (`admin`, `professor`, `super_admin`)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "result": [
    {
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
      "updated_at": "2026-03-01T12:00:00.000Z"
    }
  ]
}
```

---

### 3. Create Student Details (`POST /`)
Calculates combined fees from selected subjects and packages, creates the `StudentDetail` record, and creates corresponding `Fee`, `StudentSubject`, and `StudentPackage` rows in a nested Prisma write.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/student-details`
- **Auth**: None (Public)
- **Request Body (`StudentDetailReqBodyModel`)**:
```json
{
  "student_id": "8488e001-c887-4eb7-86c0-7612d9198642",
  "parent_contact": "9820098200",
  "branch_id": "e3053702-cce7-4581-81fe-0a377034b791",
  "xii_score": 88.5,
  "cet_score": 96.2,
  "jee_score": 91.4,
  "college_name": "VJTI Mumbai",
  "university_name": "Mumbai University",
  "jkb_centre": "Dadar",
  "semester": "Sem 3",
  "packages": ["c1f7a08b-0361-4df2-a3eb-b8c7e997fce5"],
  "subjects": ["3d9c9099-b131-419b-a36c-9418e5e8e811"],
  "fee_year": 2026,
  "enrolled": false
}
```

#### Calculation Flow
1. Calls `getTotalAmout(packages, subjects, prismaClient)`:
   $$\text{totalAmount} = \sum \text{Package.package\_fees} + \sum \text{Subject.subject\_fees}$$
2. Creates `StudentDetail` setting `total_fees = student_fees = pending_fees = totalAmount`.
3. Creates nested `Fee` for `fee_year`.
4. Creates `StudentSubject` and `StudentPackage` rows with the given `fee_year`.

#### Response (201 Created)
The response returns `newStudentDetail.id` — which is the `StudentDetail.id` (UUID), NOT the `user_id`.
```json
{
  "success": true,
  "message": "Record Inserted Successfully",
  "result": "90e0c034-7123-49aa-9ef1-5a0248bf9199"
}
```

#### Error Responses
- `500 Create Failure`: `{ "success": false, "message": "Error creating student record", "error": null }`

---

### 4. Update Student Details (`PUT /`)
Updates editable fields. Runs inside a `$transaction`. Does NOT update fee/package/subject enrollments (those are managed by `/admin/subject-package`).

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/student-details`
- **Auth**: Required (`admin`, `student`, `super_admin`)
- **Editable Fields**: `parent_contact`, `branch_id`, `diploma_score`, `xii_score`, `cet_score`, `jee_score`, `college_name`, `referred_by`, `university_name`, `status`, `remark`, `jkb_centre`, `semester`, `enrolled`.
- **Request Body** (only send fields to update):
```json
{
  "student_id": "8488e001-c887-4eb7-86c0-7612d9198642",
  "semester": "Sem 4",
  "cet_score": 97.1,
  "remark": "Promoted to next semester"
}
```
- **Response (200 OK)**: `{ "success": true, "message": "Record Updated Successfully", "result": 1 }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "Student can't edit student_fees!", "error": null }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "Student Detail does not exist!", "error": null }`

---

### 5. Delete Student Details (`DELETE /:student_id`)
Deletes `StudentDetail` by `user_id`. Response returns the deleted record's `StudentDetail.id`.

- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/student-details/:student_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Path Parameters**: `student_id` (string, required): `User.id`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Record Deleted Successfully",
  "result": "90e0c034-7123-49aa-9ef1-5a0248bf9199"
}
```
