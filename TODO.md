# 📝 TODOs for `jkb-backend`

## 🧹 Code Quality Improvements (For New Contributors)

- Replace `userRole.create` with `userRole.connect` to avoid unintended role creation.
- Add uniqueness check for email to prevent duplicate users.
- Insert `assert` statements where appropriate to ensure safe assumptions in logic.

## 🧪 Testing / Project Structure Enhancements

- Create a `test/` folder (not `tests/`) to organize all backend test files using **Vitest**.
  This will include **unit tests**, **integration tests**, and **API route tests** for your Express backend.