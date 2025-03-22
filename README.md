# Project Setup Guide

Welcome to the project! Follow these steps to set up the project after cloning it.

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (Recommended: LTS version)
- [PostgreSQL](https://www.postgresql.org/) (or any other database you plan to use)
- [Prisma CLI](https://www.prisma.io/docs/concepts/components/prisma-cli)

## Installation Steps

### 1. Clone the Repository
```sh
git clone https://github.com/Swaraj2004/jkb-backend
cd jkb-backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:

```ini
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
ALGORITHM="HS256"
SECRET_KEY="your_secret_key"
PORT=3000
```

**Note:** Update `DATABASE_URL` with your actual database credentials.

### 4. Set Up Database
Run the following commands to initialize the database:
```sh
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the Development Server
```sh
npm run dev
```

### 6. Build and Run the Server
```sh
npm run build
npm start
```

### 7. Verify the Setup
Check if the API is running properly by visiting:
```
http://localhost:3000
```

## Additional Commands

- **Reset the Database**:
  ```sh
  npx prisma migrate reset
  ```
  This will reset all data and apply migrations again.

- **Open Prisma Studio** (GUI for database management):
  ```sh
  npx prisma studio
  ```

## Troubleshooting
- If you encounter database connection issues, verify your `DATABASE_URL`.
- Ensure PostgreSQL is running.
- Run `npx prisma doctor` to check for any issues.

Happy coding! 🚀