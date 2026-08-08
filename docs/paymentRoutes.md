# Accounting, Fees & Payment Management API Documentation

- **Route Source**: [src/routes/paymentRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/paymentRoutes.ts)
- **Controller Source**: [src/controllers/paymentController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/paymentController.ts)
- **Mount Point**: `/api/v3` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L61)
- **Primary Database Models**: `Payment`, `Fee`, `StudentDetail`, `User`, `SubjectPayment`, `PackagePayment`

---

## 🎯 Overview & Accounting Rules

The Payment and Fee Management module handles tuition billing, student installment payments, GST and Non-GST receipt number generation based on the Indian Financial Year (April 15th – April 14th), pending balance recalculations, and fee modifications.

### 💰 Critical Accounting & Billing Rules
1. **Financial Year & Date Windows**:
   - The financial year runs from **April 15th** of the current year to **April 14th 23:59:59.999** of the following year.
2. **Receipt Number Generation Formula**:
   - **Prefix**: `'G'` for GST invoices (`is_gst === true`), `'NG'` for Non-GST receipts (`is_gst === false`).
   - **Format**: `${prefix}${currentYear}${nextYear2Digits}${sequencePadded4}`
   - *Example*: `G2025260001`, `NG2025260042`.
3. **Pending Fee Math & Validation**:
   - $\text{Total Paid} = \sum \text{Payment.amount}$ for that fee record.
   - New payment is rejected if $\text{amount} + \text{Total Paid} > \text{Fee.student\_fees}$.
   - Upon successful payment in a Prisma transaction:
     $$\text{Pending Fees} = \text{Fee.student\_fees} - (\text{Total Paid} + \text{currentAmount})$$
     `StudentDetail.enrolled` is set to `true`.
4. **Student Fee Constraints**:
   - $\text{Fee.student\_fees} \le \text{Fee.total\_fees}$
   - $\text{Fee.student\_fees} \ge \text{Total Paid}$

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Get Payment by ID | `GET` | `/api/v3/admin/payments/:payment_id` | Yes | `admin`, `super_admin` |
| Get All Payments (Date Filter) | `GET` | `/api/v3/admin/payments` | Yes | `admin`, `super_admin` |
| Get Student Payments (by User ID) | `GET` | `/api/v3/admin/student-payments/:user_id` | Yes | `admin`, `student`, `super_admin` |
| Create Payment | `POST` | `/api/v3/admin/payments` | Yes | `admin`, `super_admin` |
| Edit Payment | `PUT` | `/api/v3/admin/payments` | Yes | `admin`, `super_admin` |
| Get Student Payments (by Student Detail ID) | `GET` | `/api/v3/student/payments` | Yes | `admin`, `student`, `super_admin` |
| Edit Student Discounted Fees | `PUT` | `/api/v3/admin/student-fees` | Yes | `admin`, `super_admin` |

---

## 📡 Endpoint Specifications

### 1. Get Payment by ID (`/admin/payments/:payment_id`)
Fetches a single payment and includes the associated `User` (student) profile and `StudentDetail`.

#### Prisma Select / Include
```typescript
prismaClient.payment.findUnique({
  where: { id: paymentId },
  include: {
    student: {
      select: {
        email, full_name, phone, location, id, lastlogin, created_at,
        studentDetail: true   // full StudentDetail model
      }
    }
  }
})
```

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/payments/:payment_id`
- **Auth**: Required (`admin`, `super_admin`)

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment fetched successfully",
  "result": {
    "id": "a90e3845-f09b-4328-89c0-ec7b4f590011",
    "fee_id": "e87f3b89-21a4-406b-9c3f-42e88a08ef41",
    "receipt_number": "G2025260001",
    "amount": "15000",
    "mode": "NEFT",
    "status": "Completed",
    "is_gst": true,
    "user_id": "8488e001-c887-4eb7-86c0-7612d9198642",
    "remark": "First Installment",
    "pending": "10000",
    "created_at": "2026-02-10T11:20:00.000Z",
    "updated_at": null,
    "created_by": "f5127025-a128-4f27-a066-70e0f31be4db",
    "student": {
      "id": "8488e001-c887-4eb7-86c0-7612d9198642",
      "full_name": "Rohan Sharma",
      "email": "rohan@gmail.com",
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
        "updated_at": "2026-03-01T12:00:00.000Z"
      }
    }
  }
}
```

---

### 2. Get All Payments in Date Range (`/admin/payments`)
Uses `include: { student: { select: { ... studentDetail: true } } }` — same structure as above for each payment record.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/admin/payments`
- **Auth**: Required (`admin`, `super_admin`)
- **Query Parameters**:
  - `start_date` (string, required): Format `YYYY-MM-DD`.
  - `end_date` (string, required): Format `YYYY-MM-DD`.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payments fetched successfully",
  "result": [
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
      "pending": "10000",
      "created_at": "2026-02-10T11:20:00.000Z",
      "updated_at": null,
      "created_by": "f5127025-a128-4f27-a066-70e0f31be4db",
      "student": {
        "id": "8488e001-c887-4eb7-86c0-7612d9198642",
        "full_name": "Rohan Sharma",
        "email": "rohan@gmail.com",
        "phone": "9820012345",
        "location": "Mumbai",
        "lastlogin": "2026-03-20T10:00:00.000Z",
        "created_at": "2026-01-15T08:30:00.000Z",
        "studentDetail": { "...": "Full StudentDetail object — all fields" }
      }
    }
  ]
}
```

---

### 3. Get Student Payments & Fee Summary (`/admin/student-payments/:user_id` and `/student/payments`)
The `getStudentPayments` controller looks up the `Fee` record by composite key `year_student_id` where `student_id` is `StudentDetail.id`. Each payment in the `payments` array includes the linked `User` (student), `subjectPayments`, and `packagePayments`.

- **`/admin/student-payments/:user_id`**: Uses `user_id` from path. Student can only access their own ID.
- **`/student/payments?student_id=...&year=...`**: Student Detail ID from query.

#### Prisma Select Clause
```typescript
fee.findUnique({
  where: { year_student_id: { student_id, year: numYear } },
  select: {
    id, student_fees, total_fees,
    payments: {
      select: {
        id, fee_id, receipt_number, amount, mode, status, is_gst,
        user_id, remark, pending, created_by, created_at,
        student: { select: { email, full_name, phone, location, id, lastlogin, created_at, studentDetail: true } },
        subjectPayments: { select: { subject: { select: { name, id, subject_fees } } } },
        packagePayments: { select: { package: { select: { package_name, id, package_fees } } } }
      }
    }
  }
})
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment fetched successfully",
  "result": {
    "id": "e87f3b89-21a4-406b-9c3f-42e88a08ef41",
    "student_fees": "25000",
    "total_fees": "25000",
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
        "pending": "10000",
        "created_by": "f5127025-a128-4f27-a066-70e0f31be4db",
        "created_at": "2026-02-10T11:20:00.000Z",
        "student": {
          "id": "8488e001-c887-4eb7-86c0-7612d9198642",
          "full_name": "Rohan Sharma",
          "email": "rohan@gmail.com",
          "phone": "9820012345",
          "location": "Mumbai",
          "lastlogin": "2026-03-20T10:00:00.000Z",
          "created_at": "2026-01-15T08:30:00.000Z",
          "studentDetail": { "...": "Full StudentDetail object" }
        },
        "subjectPayments": [
          {
            "subject": {
              "id": "d09a25b1-1ec8-490d-95cf-94578b8849b2",
              "name": "Applied Mathematics IV",
              "subject_fees": "6000"
            }
          }
        ],
        "packagePayments": [
          {
            "package": {
              "id": "c1f7a08b-0361-4df2-a3eb-b8c7e997fce5",
              "package_name": "GATE Computer Science 2026",
              "package_fees": "30000"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 4. Create a Payment (`/admin/payments`)
Records a new fee installment, generates the receipt number, and updates pending balance within a `$transaction`.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/admin/payments`
- **Auth**: Required (`admin`, `super_admin`)
- **Required Fields**: `student_id` (`StudentDetail.id`), `user_id` (`User.id`), `year`, `amount`, `is_gst`.
- **Request Body**:
```json
{
  "student_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
  "user_id": "8488e001-c887-4eb7-86c0-7612d9198642",
  "year": 2026,
  "amount": 10000,
  "mode": "Cheque",
  "status": "Cleared",
  "is_gst": true,
  "staff_id": "f5127025-a128-4f27-a066-70e0f31be4db",
  "remark": "Second Installment"
}
```

#### Error Responses
- `400 Bad Request`: `{ "success": false, "message": "user_id, student_id, amount and year required", "error": null }`
- `500 Create Failure` (no fee record): `{ "success": false, "message": "first select student Package or Subjects for the year and student_id selected.", "error": null }`
- `500 Create Failure` (amount exceeds): `{ "success": false, "message": "amount cannot be greaterThan than (student_fees - previously Paid Payments).", "error": null }`

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Payment created successfully",
  "result": "a90e3845-f09b-4328-89c0-ec7b4f590011"
}
```

---

### 5. Edit a Payment (`/admin/payments`)
Adjusts amount, mode, status and recalculates `pending` and `StudentDetail.pending_fees` in a transaction.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/admin/payments`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "id": "a90e3845-f09b-4328-89c0-ec7b4f590011",
  "amount": 12000,
  "mode": "UPI",
  "status": "Cleared",
  "is_gst": true,
  "remark": "Adjusted amount"
}
```
- **Response (200 OK)**: `{ "success": true, "message": "Payment updated successfully", "result": 1 }`
- **Error (400 Bad Request)**: `{ "success": false, "message": "Amount paid cannot be greater than pending fees", "error": null }`
- **Error (404 Not Found)**: `{ "success": false, "message": "Payment record not found or payment amount is null", "error": null }`

---

### 6. Edit Student Discounted Fees (`/admin/student-fees`)
Updates the custom negotiated `student_fees` for a student and year.

- **HTTP Method**: `PUT`
- **Path**: `/api/v3/admin/student-fees`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "student_id": "90e0c034-7123-49aa-9ef1-5a0248bf9199",
  "year": 2026,
  "student_fees": 22000
}
```
- **Validation Rules**:
  - Rejects if `student_fees > Fee.total_fees`: `"student_fees cannot be greater than than total_fees."`
  - Rejects if `student_fees < feesAlreadyPaid`: `"student_fees cannot be less than the fees aldready paid."`
- **Response (200 OK)**: `{ "success": true, "message": "Student Fees edited Successfully!", "result": 1 }`
