const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Swagger TypeScript API",
    version: "1.0.0",
    description: "Simple API using Express, TypeScript, Swagger UI, and CORS",
  },
  servers: [
    {
      url: "http://localhost:5000",
    },
  ],
  paths: {
    "/api/users": {
      get: {
        summary: "Get all users",
        responses: {
          "200": {
            description: "List of users",
          },
        },
      },
      post: {
        summary: "Create a new user",
        responses: {
          "201": {
            description: "User created",
          },
        },
      },
    },
    "/api/products": {
      get: {
        summary: "Get all products",
        responses: {
          "200": {
            description: "List of products",
          },
        },
      },
    },
  },
};

export default swaggerDocument;
