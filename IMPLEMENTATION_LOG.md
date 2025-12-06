## Redis Caching

**Purpose:**  
Reduce database load and improve response time for frequent `GET /professor/test/status/:test_id` requests by caching `test_status` in Redis.

**Key & Value Stored:**

- **Key:** `test.id` (UUID)
- **Value:** `test.test_status` (`InProgress`, `Completed`, etc.)
- **TTL:**
  - When starting test: `(test.total_time || 30) * 60` seconds
  - When test completed: `5 * 60` seconds

**Flow:**

1. **Start Test (`startTest`)**
   - Update DB: `test_status = InProgress`
   - Cache in Redis:
     ```ts
     await redisClient.set(test.id, test.test_status, {
       EX: (test.total_time || 30) * 60,
     });
     ```

2. **Get Test Status (`getTestStatus`)**
   - Try Redis first:
     ```ts
     const testStatus = await redisClient.get(test_id);
     ```
   - If found → return cached value.
   - If not found → read from DB, then cache again.

**Notes:**

- Redis acts as a fast lookup layer; DB remains the source of truth.
- If Redis is down or cache miss occurs, system falls back to DB query.
- Namespace keys (e.g., `test:status:<id>`) could improve clarity.

---

## Fee

1. so the fee Entry in the table is `created` during creation of the StudentDetails and /api/v3/admin/subject-package
