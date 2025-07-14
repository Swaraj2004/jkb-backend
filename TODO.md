# 📝 TODOs for `jkb-backend`

## 🧹 Code Quality Improvements (For New Contributors)

- Replace `userRole.create` with `userRole.connect` to avoid unintended role creation.
- Add uniqueness check for email to prevent duplicate users.
- Insert `assert` statements where appropriate to ensure safe assumptions in logic.

## 🧪 Testing / Project Structure Enhancements

- Create a `test/` folder (not `tests/`) to organize all backend test files using **Vitest**.
  This will include **unit tests**, **integration tests**, and **API route tests** for your Express backend.


## 🚀 Future Improvement: Support Multiple Test Submissions per Student

To allow multiple `TestSubmission` entries for the same student in a given test (e.g., for retries or re-attempts), implement the following strategy:

### First edit the schema.prisma file and uncomment the necessary field and perform migrations

- **New Endpoint Behavior**:  
  Create an endpoint that manages test submissions based on the student's current state:

  - ✅ If a `TestSubmission` already exists for the student and test **with `is_submitted = false`**, return that submission's ID. This allows the student to **resume** their in-progress test.
  
  - ➕ If **no such in-progress submission exists**, create a **new `TestSubmission`** record for this attempt and return its ID. This allows the student to **start a fresh attempt**.

This setup ensures students can continue incomplete tests while still supporting multiple attempts in the future.

---

### ⚠️ Potential Considerations & Edge Cases

- **Stale In-Progress Submissions**  
  Users might abandon a test mid-way, leaving behind submissions with `is_submitted = false`. This can clutter your database over time.  
  👉 Consider implementing a **time-to-live (TTL)** mechanism or **background cleanup job** that deletes or archives abandoned submissions after a set period (e.g., 24 hours of inactivity).

- **Unbounded Growth**  
  Allowing unlimited attempts can lead to unbounded records.  
  👉 Consider adding a **maximum attempt limit**, auto-archiving old submissions, or tracking attempt numbers per user.

- **UX Clarity**  
  Students should always know whether they’re resuming an old test or starting a new one.  
  👉 Show appropriate status messages and time left if resuming an in-progress submission.

---
