import express, { Response, Request } from 'express';
import { createUser, deleteUser, getUsers, updateUser } from '../controllers/userController';
import { AuthenticatedRequest, authMiddleware } from '../middlewares/authMiddleware';
import { AUTH_ROLES } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import authController from '../controllers/authController'; // Adjust the import based on your project structure
// import { User, UpdateUser } from '../schemas/userSchemas'; // Adjust the import based on your project structure
// import { Hash } from '../utils/hash'; // Adjust the import based on your project structure

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Operations related to user management
 */

/**
 * @swagger
 * /users/{user_id}:
 *   get:
 *     tags: [User Management]
 *     summary: Get a specific user by ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: The ID of the user to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single user object
 */

// routes are not yet protected as per the roles
router.get('/:user_id', async (req, res) => {
    return getUsers(req, res, req.params.user_id);
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [User Management]
 *     summary: Get all users with optional year filter
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter users by creation date
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of user objects
 */

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    if(req.user && AUTH_ROLES.includes(req.user.role_name)){
        return getUsers(req, res);
    }
    res.status(401).json(errorJson("Unauthorised", null));
});

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [User Management]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user object
 */

// model UserRole {
//     id      String @id @default(uuid()) @db.Uuid
//     user_id String @db.Uuid
//     role_id String @db.Uuid

//     user User @relation(fields: [user_id], references: [id])
//     role Role @relation(fields: [role_id], references: [id])
//   }
//   model Role {
//     id         String   @id @default(uuid()) @db.Uuid
//     name       String   @unique
//     created_at DateTime @default(now())
//     updated_at DateTime @default(now()) @updatedAt

//     userRoles UserRole[]
//   }

// routes are not yet protected as per the roles
router.post('/', async (req: Request, res: Response) => {
    return createUser(req, res);
});

/**
 * @swagger
 * /users/{user_id}:
 *   delete:
 *     tags: [User Management]
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: The ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */

// routes are not yet protected as per the roles
router.delete('/:user_id', async (req, res) => {
    return deleteUser(req, res);
});

/**
 * @swagger
 * /users:
 *   put:
 *     tags: [User Management]
 *     summary: Update a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       202:
 *         description: The updated user object
 */
router.put('/', async (req, res) => {
    return updateUser(req, res);
});

export default router;
