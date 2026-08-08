# Authentication & Password Management API Documentation

- **Route Source**: [src/routes/loginRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/loginRoutes.ts)
- **Controller Source**: [src/controllers/loginController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/loginController.ts) & [src/utils/send_email.ts](file:///c:/Users/user/Desktop/jkb-backend/src/utils/send_email.ts)
- **Mount Point**: `/api/v3/auth` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L60)
- **Primary Database Models**: `User`, `UserRole`, `Role`, `StudentDetail`

---

## 🎯 Overview & Purpose

The Authentication module provides secure authentication, JWT token generation, user login session verification, Winston audit logging, and email-based multi-step OTP password resets.

---

## 🔐 Core Authentication Specifications

- **Password Hashing**: Bcrypt with Salt Rounds = `10` (`SALT = 10`).
- **JWT Token Payload**:
  ```typescript
  export interface TokenPayload {
    user_id: string;   // User UUID
    role_name: string; // 'student' | 'professor' | 'admin' | 'super_admin'
  }
  ```
- **Token Expiry**: `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 60 * 24` (24 hours / 1440 minutes).
- **Timezone**: Indian Standard Time (`TZ_INDIA = 'Asia/Kolkata'`).
- **Audit Logging**: Successful logins trigger `USER_LOGIN_SUCCESS` in `logs/auth-YYYY-MM-DD.log`.

---

## 📡 Endpoint Specifications

### 1. User Login (`/login-user`)
Authenticates credentials, updates `User.lastlogin` with Indian timezone timestamp, logs audit event, and issues a signed JWT access token.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/login-user`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "email": "student@jkb.edu",
  "password": "SecurePassword123"
}
```

#### Internal Logic
1. Queries `User` by unique `email`.
2. Validates password via `bcrypt.compare()`.
3. Resolves the user's role via `UserRole` and `Role`.
4. If the user has a linked `StudentDetail`, retrieves `studentDetail.id`.
5. Encodes `{ user_id, role_name }` into signed JWT access token.
6. Updates `User.lastlogin` with current IST timestamp (`toZonedTime(new Date(), 'Asia/Kolkata')`).
7. Logs `USER_LOGIN_SUCCESS` with user ID, email, role, and IP address.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Login Successful",
  "full_name": "Aum Patel",
  "email": "student@jkb.edu",
  "user_id": "8488e001-c887-4eb7-86c0-7612d9198642",
  "role_id": "a11979b9-d2b3-46fa-a832-6bf797621c83",
  "user_detail_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
  "role_name": "student",
  "expire_minutes": 86400,
  "current_timestamp": "2026-03-23T14:35:10+05:30",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

#### Error Responses
- `401 Unauthorized`: `{ "success": false, "message": "Invalid Credentials", "error": null }`
- `404 Not Found`: `{ "success": false, "message": "User Record Not Found", "error": null }`
- `500 Server Error`: `{ "success": false, "message": "Failed to login user", "error": null }`

---

### 2. Check Login Status (`/login-status/:user_id`)
Checks if a user's session is still valid based on elapsed time since `lastlogin`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/login-status/:user_id`
- **Auth**: None
- **Path Parameters**: `user_id` (string, required): UUID of the user.
- **Response (200 OK - Active Session)**:
```json
{
  "success": true,
  "message": "User logged in!",
  "time_left": 86340
}
```
- **Error (400 Bad Request - Expired Session)**:
```json
{
  "success": false,
  "message": "User logged out!",
  "error": 0
}
```

---

### 3. Send OTP Over Email (`/send-otp/:user_email`)
Generates a 4-digit numeric OTP, saves it to `User.otp_code`, and emails the user via Nodemailer.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/send-otp/:user_email`
- **Auth**: None
- **Path Parameters**: `user_email` (string, required): User email address.
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "OTP sent successfully!",
  "result": null
}
```
- **Error (404 Not Found)**: `{ "success": false, "message": "User record not found!", "error": null }`

---

### 4. Verify OTP Code (`/verify-otp/:user_email/:otp_code`)
Validates the submitted OTP against `User.otp_code`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/verify-otp/:user_email/:otp_code`
- **Auth**: None
- **Path Parameters**:
  - `user_email` (string, required)
  - `otp_code` (string, required)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "result": null
}
```
- **Error (401 Unauthorized)**: `{ "success": false, "message": "Invalid OTP", "error": null }`

---

### 5. Reset Password (`/reset-password`)
Hashes the new password with bcrypt salt rounds = 10 and updates `User.password`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/auth/reset-password`
- **Auth**: None
- **Query Parameters**:
  - `email_address` (string, required)
  - `password` (string, required)
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password Reset Successfully!",
  "result": null
}
```
- **Error (400 Bad Request)**: `{ "success": true, "message": "Email Address and Password required!", "result": null }`
- **Error (404 Not Found)**: `{ "success": false, "message": "User Record Not Found", "error": null }`
