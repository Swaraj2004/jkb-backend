# 📝 TODOs for `jkb-backend`

---

## 1️⃣ 🧹 Code Quality Improvements (For New Contributors)

1.1. Replace `userRole.create` with `userRole.connect` to avoid unintended role creation.

1.2. Add uniqueness check for email to prevent duplicate users.

1.3. Insert `assert` statements where appropriate to ensure safe assumptions in logic.

---

## 2️⃣ Swagger docs

Complete swagger docs for each api endpoint

---

## 2️⃣ 🧪 Testing / Project Structure Enhancements

2.1. Create a `test/` folder (not `tests/`) to organize all backend test files using **Vitest**.  
&emsp;→ This should include **unit tests**, **integration tests**, and **API route tests** for your Express backend.

---

## 3️⃣ 📝 Logging Enhancement with Winston

3.1. Integrate **Winston**, a powerful and flexible logging library, to enable scalable and structured logging across the Express app.

---

## 4️⃣ 🚀 Future Improvement: Support Multiple Test Submissions per Student

4.1. Allow multiple `TestSubmission` entries for the same student in a given test (e.g., for retries or re-attempts).

4.2. Edit `schema.prisma` to remove any unique constraints on `(user_id, test_id)` if supporting multiple attempts.

4.3. Perform necessary **Prisma migrations**.

---

### ✅ 4.4. TODO: Get Student Submissions for Test

- **Route**: `GET /test/:test_id/submissions`
- **Access**: Admin, Professor
- **File**: `routes/testRoutes.ts`
- **Description**: Fetch student-selected options and correct options for the given test.

#### ➕ New Endpoint Behavior:

- If a `TestSubmission` already exists with `is_submitted = false`, return that submission's ID.  
  → Enables resuming in-progress submissions.

- If no such submission exists, create a new `TestSubmission` and return its ID.  
  → Enables starting a fresh attempt.

---

### ⚠️ 4.5. Potential Considerations & Edge Cases

- **Stale In-Progress Submissions**  
  👉 Implement TTL or background cleanup for abandoned `is_submitted = false` submissions.

- **Unbounded Growth**  
  👉 Add attempt limit, or archive older submissions.

- **UX Clarity**  
  👉 Notify users whether they are resuming or starting fresh.

---

## 5️⃣ 🧭 Further Improvements

5.1. Read about `@db.Money` in Prisma & PostgreSQL docs — decide if it's the best fit or switch to `@db.Decimal(10, 2)` for more flexibility and precision.

---

## 6️⃣ ⚡ Caching Improvements

6.1. Implement Redis caching for `subject`, `package`, and `user_role` queries — reduce repeated DB lookups on frequently accessed endpoints.

6.4. Set appropriate TTL (e.g., 1 hour) on cached values to ensure data freshness and avoid stale results.

---

## Better Practise

- [ ] Learn how Express `Request<Params, ResBody, ReqBody, ReqQuery>` generics work
- [ ] Practice typing `req.body`, `req.params`, and `req.query` in real route handlers

## redundant columns

- Eliminate duplicate correct-option storage: pick is_correct or correct_option_id
  (before doing this be sure of what you are doing is redundant)

## Index columns

- Use indexes to speed up frequent `WHERE`, `JOIN`, and `ORDER BY` queries; avoid them on rarely queried or frequently updated columns.
- TODO: Read database internals (indexes, query planning, B-trees) in detail to understand performance trade-offs and corre

## Response code 204

- Use **204 No Content** when an operation succeeds but there is nothing meaningful to return (e.g., DELETE, idempotent updates).
- TODO: Replace empty `200 {}` responses with `204` where no response body is required.