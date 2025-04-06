import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 8000;

export const BASE_URLS = {
  USER: `/api/v3/auth/users`,
  AUTH: `/api/v3/auth`,
  ADMIN: `/api/v3/admin`,
  BRANCHES: `/api/v3/admin/branches`,
  STUDENT_DETAILS: `/api/v3/student-details`,
  PROFESSOR: `/api/v3/professor`,
  PRODUCTS: `/api/v3/api/products`,
  ATTENDANCE: `/api/v3`,
  PAYMENT: `/api/v3`,
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JKB Education Group',
      version: '1.0.0',
      description: 'JKB Education Group Backend Application',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;