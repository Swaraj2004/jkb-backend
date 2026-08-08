# Role Management API Documentation

- **Route Source**: [src/routes/roleRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/roleRoutes.ts)
- **Controller Source**: [src/controllers/roleController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/roleController.ts)
- **Mount Point**: `/api/v3/auth` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L64)
- **Primary Database Models**: `Role`, `UserRole`

---

## 🎯 Overview & RBAC Foundations

The Role Management module manages the role definitions that power role-based access control (RBAC). Roles are mapped to users via the `UserRole` junction table.

```prisma
model Role {
  id         String    @id @default(uuid()) @db.Uuid
  name       Roles     @unique @default(student)
  created_at DateTime  @default(now()) @db.Timestamptz()
  updated_at DateTime? @updatedAt @db.Timestamptz()

  userRole UserRole[]
}

enum Roles {
  student
  professor
  admin
  super_admin
}
```

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Get All Roles | `GET` | `/api/v3/auth/roles` | No | Public |
| Get Role by ID | `GET` | `/api/v3/auth/roles/:role_id` | No | Public |
| Create Role | `POST` | `/api/v3/auth/roles` | Yes | `admin`, `super_admin` |
| Update Role | `PUT` | `/api/v3/auth/roles` | Yes | `admin`, `super_admin` |
| Delete Role | `DELETE` | `/api/v3/auth/roles/:role_id` | Yes | `admin`, `super_admin` (Super Admin Protected) |

---

## 📡 Endpoint Specifications

### 1. Get All Roles
Retrieves all configured system roles.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/auth/roles`
- **Auth**: None (Public)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Roles fetched successfully",
  "result": [
    {
      "id": "a11979b9-d2b3-46fa-a832-6bf797621c83",
      "name": "student",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": null
    },
    {
      "id": "f29079b9-d2b3-46fa-a832-6bf797621c84",
      "name": "professor",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": null
    },
    {
      "id": "c39079b9-d2b3-46fa-a832-6bf797621c85",
      "name": "admin",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": null
    },
    {
      "id": "d49079b9-d2b3-46fa-a832-6bf797621c86",
      "name": "super_admin",
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": null
    }
  ]
}
```

---

### 2. Get Role by ID
- **HTTP Method**: `GET`
- **Path**: `/api/v3/auth/roles/:role_id`
- **Path Parameters**: `role_id` (string, required): UUID of the Role.
- **Response (200 OK)**: Returns the single `Role` entity.
- **Error (404 Not Found)**: `{ "success": false, "message": "Role not found", "error": null }`

---

### 3. Create Role
- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/roles`
- **Request Body**: `{ "name": "student" }`
- **Response (201 Created)**: `{ "success": true, "message": "Role created successfully", "result": "uuid" }`

---

### 4. Delete Role
- **HTTP Method**: `DELETE`
- **Path**: `/api/v3/auth/roles/:role_id`
- **Protected Logic**: If `role.name === 'super_admin'`, deletion is aborted with `400 Bad Request` (`"Super admin cannot be deleted!"`).
- **Response (200 OK)**: `{ "success": true, "message": "Role Deleted Successfully!", "result": 1 }`
