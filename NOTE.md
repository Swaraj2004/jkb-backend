# Express `Request` Type in TypeScript

In TypeScript, Express provides a **generic `Request` type** that allows us to strongly type different parts of an HTTP request.

---

## 📌 What is `Request`?

`Request` represents the incoming HTTP request in an Express route handler.

In TypeScript (simplified), it is defined as:

```ts
Request<Params, ResBody, ReqBody, ReqQuery>
```

It accepts **4 generic type parameters**.

---

## 🧩 Generic Parameters Explained

```ts
Request<
  Params,    // Type of req.params
  ResBody,   // Type of response body (res.json)
  ReqBody,   // Type of req.body
  ReqQuery   // Type of req.query
>
```

### 1️⃣ `Params`
- Represents **route parameters**
- Example: `/users/:id`

```ts
Request<{ id: string }>
```

Usage:
```ts
req.params.id // string
```

---

### 2️⃣ `ResBody`
- Represents the **response body type**
- Rarely used in practice
- Mostly helpful for strict API typing

Example:
```ts
Request<{}, { success: boolean }>
```

---

### 3️⃣ `ReqBody`
- Represents the **request body (`req.body`)**
- Most commonly used generic
- Helps prevent invalid or missing fields

Example:
```ts
type CreateUserDTO = {
  name: string;
  email: string;
};

Request<{}, {}, CreateUserDTO>
```

Usage:
```ts
req.body.name   // string
req.body.email  // string
```

---

### 4️⃣ `ReqQuery`
- Represents **query parameters**
- Values are usually strings

Example:
```ts
Request<{}, {}, {}, { page: string; limit: string }>
```

Usage:
```ts
req.query.page  // string
```

---

## ✅ Common Usage Patterns

### Typing only `req.body` (most common)
```ts
Request<{}, {}, CreateLectureDTO>
```

---

### Typing route params + body
```ts
Request<{ id: string }, {}, UpdateLectureDTO>
```

---

### Typing query params
```ts
Request<{}, {}, {}, { search: string }>
```

---

## 🧠 Mental Model

Think of `Request` as a **container** with 4 sections:

- `req.params`
- `req.body`
- `req.query`
- `res.json()`

TypeScript generics allow you to **type only what you care about**.

---

## ❌ Without Generics (Bad)
```ts
req.body.anything // allowed ❌
```

## ✅ With Generics (Good)
```ts
req.body.subject_id // ✅ typed
req.body.random     // ❌ compile-time error
```

---

## 📝 Summary

- `Request` is a **generic type**
- It improves **type safety**
- Helps catch errors at **compile time**
- Especially useful for validating `req.body`

---