# Branch Management API Documentation

- **Route Source**: [src/routes/branchRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/branchRoutes.ts)
- **Controller Source**: [src/controllers/branchController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/branchController.ts)
- **Mount Point**: `/api/v3/admin/branches` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L58)
- **Primary Database Model**: `Branch`

---

## 🎯 Overview & Purpose

The Branch Management module manages educational branches/streams (such as *Computer Engineering*, *Mechanical Engineering*, *Information Technology*, etc.). Branches are linked to student records (`StudentDetail.branch_id`) to categorize academic tracks across JKB Education Group.

---

## 🗄 Prisma Schema Definition

```prisma
model Branch {
  id         String    @id @default(uuid()) @db.Uuid
  name       String
  created_at DateTime  @default(now()) @db.Timestamptz()
  updated_at DateTime? @updatedAt @db.Timestamptz()

  studentDetails StudentDetail[]
}
```

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Get All Branches | `GET` | `/api/v3/admin/branches` | No (Public) | Anyone |
| Get Branch By ID | `GET` | `/api/v3/admin/branches/:branch_id` | No (Public) | Anyone |
| Create Branch | `POST` | `/api/v3/admin/branches` | Yes | `admin`, `super_admin` |
| Update Branch | `PUT` | `/api/v3/admin/branches/:branch_id` | Yes | `admin`, `super_admin` |
| Delete Branch | `DELETE` | `/api/v3/admin/branches/:branch_id` | Yes | `admin`, `super_admin` |

---

## 📡 Endpoint Specifications

### 1. Get All Branches (ID & Name)
Returns a list of all active branches with their unique IDs and names. Used across admin panels and registration dropdowns.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/branches`
- **Auth**: None (Public)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Get Branches SuccessFul",
  "result": [
    {
      "id": "e3053702-cce7-4581-81fe-0a377034b791",
      "name": "Computer Science & Engineering"
    },
    {
      "id": "b9f91a56-8201-4be6-a197-2a447833a699",
      "name": "Mechanical Engineering"
    }
  ]
}
```

---

### 2. Get Branch by ID
Retrieves details for a single branch.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/branches/:branch_id`
- **Auth**: None (Public)
- **Path Parameters**:
  - `branch_id` (string, required): UUID of the branch.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Get branch SuccessFull!",
  "result": {
    "id": "e3053702-cce7-4581-81fe-0a377034b791",
    "name": "Computer Science & Engineering"
  }
}
```
- **Error (404 Not Found)**:
```json
{
  "success": false,
  "message": "Branch not found",
  "error": null
}
```

---

### 3. Create a New Branch
Creates a new branch record.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/admin/branches`
- **Auth**: Required (`admin`, `super_admin`)
- **Headers**: `Authorization: Bearer <jwt>`
- **Request Body**:
```json
{
  "name": "Artificial Intelligence & Data Science"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Branch Created successfully!",
  "result": "f12c98d0-6fb5-48b9-bb88-1fa9044db919"
}
```
- **Error (400 Bad Request)**:
```json
{
  "success": false,
  "message": "Name is required",
  "error": null
}
```

---

### 4. Update an Existing Branch
Modifies the name of an existing branch.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/admin/branches/:branch_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Headers**: `Authorization: Bearer <jwt>`
- **Path Parameters**:
  - `branch_id` (string, required): UUID of the branch.
- **Request Body**:
```json
{
  "name": "AI & Machine Learning"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Branch Updated Successfully",
  "result": 1
}
```

---

### 5. Delete a Branch
Removes a branch by ID.

- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/admin/branches/:branch_id`
- **Auth**: Required (`admin`, `super_admin`)
- **Headers**: `Authorization: Bearer <jwt>`
- **Path Parameters**:
  - `branch_id` (string, required): UUID of the branch.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Branch Deleted Succesfully!",
  "result": 1
}
```
