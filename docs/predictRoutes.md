# Legacy College Prediction API Documentation (Deprecated)

- **Route Source**: [src/routes/predictRoutes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/predictRoutes.ts)
- **Mount Status**: Unmounted in [src/server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts) (Superceded by [src/routes/mhai_routes.ts](file:///c:/Users/user/Desktop/jkb-backend/src/routes/mhai_routes.ts))
- **Status**: ⚠️ **Deprecated / Stubbed**

---

## 🎯 Overview & Migration Guide

This file contains early prototype endpoints for predicting engineering colleges based on scores and location.

> [!NOTE]
> All active college prediction endpoints have been moved to **Maharashtra AI College Predictor** (`src/routes/mhai_routes.ts` & `src/controllers/mhai_controller.ts`), mounted at `/api/v3` in [server.ts](file:///c:/Users/user/Desktop/jkb-backend/src/server.ts#L69). Please refer to [mhai_routes.md](file:///c:/Users/user/Desktop/jkb-backend/docs/mhai_routes.md) for production implementations.

---

## 📡 Stubbed Endpoints Reference

### 1. `POST /predict-colleges-by-score`
- **Swagger Tag**: `College Prediction`
- **Schema Reference**: `ListCollegesByScore`
- **Current Status**: Handler body is commented out in source.
- **Migration Target**: `POST /api/v3/predict-colleges-by-score` (documented in [mhai_routes.md](file:///c:/Users/user/Desktop/jkb-backend/docs/mhai_routes.md)).

### 2. `POST /predict-colleges-by-location`
- **Swagger Tag**: `College Prediction`
- **Schema Reference**: `ListCollegesByLocation`
- **Current Status**: Handler body is commented out in source.
- **Migration Target**: `POST /api/v3/predict-colleges-by-location` (documented in [mhai_routes.md](file:///c:/Users/user/Desktop/jkb-backend/docs/mhai_routes.md)).
