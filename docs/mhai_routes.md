# Maharashtra AI College Predictor API Documentation

- **Route Source**: [src/routes/mhai_routes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/mhai_routes.ts)
- **Controller Source**: [src/controllers/mhai_controller.ts](file:///c:/Users/user/Desktop/jkb-backend/src/controllers/mhai_controller.ts)
- **Mount Point**: `/api/v3` in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L69)
- **Primary Database Model**: `MhAiCollege`

---

## 🎯 Overview & Purpose

The Maharashtra AI College Predictor module powers admission prediction and cut-off analysis for engineering colleges across Maharashtra based on historical MHT-CET and JEE Main cutoff percentiles, category/caste quotas, university affiliations, and geographical districts.

---

## 🗄 Prisma Data Model (`MhAiCollege`)

```prisma
model MhAiCollege {
  id              String   @id @default(uuid()) @db.Uuid
  university_name String
  university_code String
  college_name    String
  college_code    String
  branch_name     String
  branch_code     String
  location        String
  fees            Decimal?

  open Float?
  sc   Float?
  st   Float?
  vjnt Float?
  nt1  Float?
  nt2  Float?
  nt3  Float?
  obc  Float?
  tfws Float?
  ews  Float?
  sebc Float?

  college_type String
  year         Int
}
```

---

## 🔐 Access Control Matrix

| Endpoint | HTTP Method | Full Path | Auth Required | Allowed Roles |
|---|---|---|---|---|
| Predict Colleges by Score | `POST` | `/api/v3/predict-colleges-by-score` | Yes | `admin`, `super_admin` |
| Predict Colleges by Location | `POST` | `/api/v3/predict-colleges-by-location` | Yes | `admin`, `super_admin` |

---

## 📡 Endpoint Specifications

### 1. Predict Colleges by Score & Category
Filters all colleges and branches where the cutoff percentile is less than or equal to the candidate's score (`lte: score`), ordered in descending order of cutoff for best college ranking.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/predict-colleges-by-score`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body (`PredictByScoreRequest`)**:
```json
{
  "exam_type": "MHT-CET",
  "score": 94.75,
  "caste": "obc",
  "branch": "Computer Engineering",
  "university": "University of Mumbai",
  "year": 2024
}
```

#### Evaluation Rules
- If `exam_type === 'JEE'`: Sorting and cutoff filtering use the `open` merit column (`open <= score`).
- If `exam_type === 'MHT-CET'`: Uses the specified category column (e.g. `open`, `sc`, `st`, `vjnt`, `nt1`, `nt2`, `nt3`, `obc`, `tfws`, `ews`).
- Orders results descending (`orderBy: { [sortingKey]: 'desc' }`) to present the most competitive institutes first.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Colleges Fetched Successfully",
  "result": [
    {
      "id": "787c88b0-a548-4357-9d7a-ec4f6764a780",
      "university_name": "University of Mumbai",
      "university_code": "MU",
      "college_name": "Veermata Jijabai Technological Institute (VJTI)",
      "college_code": "3012",
      "branch_name": "Computer Engineering",
      "branch_code": "301224510",
      "location": "Mumbai",
      "fees": "85000",
      "open": 98.92,
      "obc": 94.21,
      "college_type": "Government Autonomous",
      "year": 2024
    }
  ]
}
```

---

### 2. Predict / Filter Colleges by Geographical Location
Groups and returns distinct colleges in a given district/location for a specific year.

- **HTTP Method**: `POST`
- **Path**: `/api/v3/predict-colleges-by-location`
- **Auth**: Required (`admin`, `super_admin`)
- **Request Body**:
```json
{
  "district": "Pune",
  "year": 2024
}
```

#### Evaluation Rules
1. Performs `prismaClient.mhAiCollege.groupBy` on `college_code` filtered by `location` and `year`.
2. Fetches all corresponding college entries matching those distinct codes.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Colleges Fetched Successfully",
  "result": [
    {
      "id": "e21c88b0-b548-4357-9d7a-ec4f6764a799",
      "university_name": "Savitribai Phule Pune University",
      "university_code": "SPPU",
      "college_name": "College of Engineering Pune (COEP)",
      "college_code": "6006",
      "branch_name": "Computer Engineering",
      "location": "Pune",
      "year": 2024
    }
  ]
}
```
