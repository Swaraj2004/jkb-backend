import express, { Response, Request } from 'express';
import {
  createStudent,
  createUser,
  createUserAndStudent,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from '../controllers/userController';
import {
  AuthenticatedRequest,
  authMiddleware,
  authorizeRoles,
} from '../middlewares/authMiddleware';
import {
  ADMIN_ROLE,
  DEFAULT_QUERRY_LIMIT,
  DEFAULT_QUERRY_OFFSET,
  PROFESSOR_ROLE,
  STUDENT_ROLE,
} from '../utils/consts';
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
 * api/v3/auth/users/{user_id}:
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

router.get(
  '/:user_id',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, STUDENT_ROLE, PROFESSOR_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // another student cant access this route only current authorizedStundent and professor
    if (!req.user) {
      res.status(401).json(errorJson('Please log in first', null));
      return;
    }

    if (
      req.user!.role_name == STUDENT_ROLE &&
      req.user.user_id != req.params.user_id
    ) {
      res.status(403).json(errorJson('Unauthorized', null));
      return;
    }
    return getUserById(req, res, req.params.user_id);
  }
);

/**
 * @swagger
 * api/v3/auth/users:
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

router.get(
  '/',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { year } = req.query;
    return getUsers(req, res, year as string);
  }
);

/**
 * @swagger
 * api/v3/auth/users:
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

router.post(
  '/',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    return createUser(req, res);
  }
);

/**
 * @swagger
 * api/v3/auth/users/student:
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

router.post('/student', async (req: Request, res: Response): Promise<void> => {
  return createStudent(req, res);
});

/**
 * @swagger
 * api/v3/auth/users/students:
 *   post:
 *     tags: [User Management]
 *     summary: Create a new Student with both creation of User and student
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

router.post('/students', async (req: Request, res: Response): Promise<void> => {
  return createUserAndStudent(req, res);
});

/**
 * @swagger
 * api/v3/auth/users/{user_id}:
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

router.delete(
  '/:user_id',
  authMiddleware,
  authorizeRoles(),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    return deleteUser(req, res);
  }
);

/**
 * @swagger
 * api/v3/auth/users:
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
router.put(
  '/',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    return updateUser(req, res);
  }
);

export default router;
