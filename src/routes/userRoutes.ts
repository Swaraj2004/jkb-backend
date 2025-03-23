import express, { Response, Request } from 'express';
import { createUser, deleteUser, getUsers, updateUser } from '../controllers/userController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { AUTH_ROLES, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';

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

router.get('/:user_id', authMiddleware, authorizeRoles([STUDENT_ROLE, PROFESSOR_ROLE]), async (req: AuthenticatedRequest, res: Response) => {
    // another student cant access this route only current authorizedStundent and professor
    if(!req.user || (!AUTH_ROLES.includes(req.user?.role_name) && req.user?.role_name !== PROFESSOR_ROLE && req.user?.id != req.params.user_id)){
        res.status(403).json(errorJson("Unauthorized", null));
        return;
    }
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

router.get('/', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req: AuthenticatedRequest, res: Response) => {
    return getUsers(req, res);
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

router.delete('/:user_id',authMiddleware, authorizeRoles(), async (req: AuthenticatedRequest, res: Response) => {
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
router.put('/',authMiddleware, authorizeRoles(),async (req: AuthenticatedRequest, res: Response) => {
    return updateUser(req, res);
});

export default router;