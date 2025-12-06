import express, { Request, Response } from 'express';
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRolesById,
  updateRole,
} from '../controllers/roleController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Role Management
 *     description: Operations related to role management
 */

/**
 * @swagger
 * /api/v3/auth/roles/{role_id}:
 *   get:
 *     tags: [Role Management]
 *     summary: Get a specific role by ID
 *     parameters:
 *       - in: path
 *         name: role_id
 *         required: true
 *         description: The ID of the role to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single role object
 */
router.get(
  '/roles/:role_id',
  async (req: Request, res: Response): Promise<void> => {
    return getRolesById(req, res, req.params.role_id);
  }
);

/**
 * @swagger
 * /api/v3/auth/roles:
 *   get:
 *     tags: [Role Management]
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: A list of role objects
 */
router.get('/roles', async (req: Request, res: Response): Promise<void> => {
  return getAllRoles(req, res);
});

/**
 * @swagger
 * /api/v3/auth/roles:
 *   post:
 *     tags: [Role Management]
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: The created role object
 */
// router.post('/roles', authMiddleware, authorizeRoles(), async (req: Request, res: Response): Promise<void> => {
//   return createRole(req, res);
// });

/**
 * @swagger
 * /api/v3/auth/roles/{role_id}:
 *   delete:
 *     tags: [Role Management]
 *     summary: Delete a role by ID
 *     parameters:
 *       - in: path
 *         name: role_id
 *         required: true
 *         description: The ID of the role to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Role deleted successfully
 */
// router.delete('/roles/:role_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response): Promise<void> => {
//   return deleteRole(req, res, req.params.role_id);
// });

/**
 * @swagger
 * /api/v3/auth/roles:
 *   put:
 *     tags: [Role Management]
 *     summary: Update a role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRole'
 *     responses:
 *       202:
 *         description: The updated role object
 */
// router.put('/roles', authMiddleware, authorizeRoles(), async (req: Request, res: Response): Promise<void> => {
//   return updateRole(req, res);
// });

export default router;
