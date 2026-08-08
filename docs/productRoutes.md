# Products Sample API Documentation

- **Route Source**: [src/routes/productRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/productRoutes.ts)
- **Controller Source**: [src/controllers/batchController.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/batchController.ts#L6)
- **Mount Point**: `/api/v3/api/products` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L62)

---

## 🎯 Overview & Purpose

The `productRoutes` module provides an example testing and health-check endpoint for verifying server reachability, response serialization, and routing middleware operation.

---

## 📡 Endpoint Details

### 1. Retrieve Example Products
Returns a static mockup array of sample inventory products.

- **HTTP Method**: `GET`
- **Path**: `/api/v3/api/products/`
- **Auth**: None (Public)
- **Response (200 OK)**:
```json
[
  {
    "id": 101,
    "name": "Laptop"
  },
  {
    "id": 102,
    "name": "Phone"
  }
]
```
