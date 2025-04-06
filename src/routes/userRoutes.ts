import express, { Response, Request } from 'express';
import { createStudent, createUser, deleteUser, getUsers, updateUser } from '../controllers/userController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { AUTH_ROLES, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';
import { BASE_URLS } from '../swagger/swaggerConfig';

const router = express.Router();
const BASE_URL = BASE_URLS.USER;

/**
 * @swagger
 * tags:
 *   - name: User Management
 *     description: Operations related to user management
 */

/**
 * @swagger
 * ${BASE_URL}/users/{user_id}:
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

router.get('/:user_id', authMiddleware, authorizeRoles([STUDENT_ROLE, PROFESSOR_ROLE]), async (req: AuthenticatedRequest, res: Response) => {
    // another student cant access this route only current authorizedStundent and professor
    if (!req.user) {
        res.status(401).json(errorJson("Please log in first", null));
        return;
    }
    
    if (
        !AUTH_ROLES.includes(req.user.role_name) &&
        req.user.role_name !== PROFESSOR_ROLE &&
        req.user.id != req.params.user_id
    ) {
        res.status(403).json(errorJson("Unauthorized", null));
        return;
    }
    return getUsers(req, res, req.params.user_id);
});

/**
 * @swagger
 * ${BASE_URL}/users:
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

router.get('/', authMiddleware, authorizeRoles(), async (req: AuthenticatedRequest, res: Response) => {
    return getUsers(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/users:
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

router.post('/',authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    return createUser(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/users/student:
 *   post:
 *     tags: [User Management]
 *     summary: Create a new Student
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

router.post('/student', async (req: Request, res: Response) => {
    return createStudent(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/users/student:
 *   post:
 *     tags: [User Management]
 *     summary: Create a new Student
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

router.post('/student', async (req: Request, res: Response) => {
    return createStudent(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/users/{user_id}:
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

router.delete('/:user_id',authMiddleware, authorizeRoles(), async (req: AuthenticatedRequest, res: Response) => {
    return deleteUser(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/users:
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
router.put('/',authMiddleware, authorizeRoles(),async (req: AuthenticatedRequest, res: Response) => {
    return updateUser(req, res);
});

export default router;