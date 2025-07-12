import express, { Request, Response } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { createBranch, deleteBranch, editBranch, getAllBranchesIdName, getBranchById } from '../controllers/branchController';
import { ADMIN_ROLE } from '../utils/consts';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Branch Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /api/v3/admin/branches/{branch_id}:
 *   get:
 *     tags: [Branch Management]
 *     summary: Get a specific branch by ID
 *     parameters:
 *       - in: path
 *         name: branch_id
 *         required: true
 *         description: The ID of the branch to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single branch object
 */
router.get('/:branch_id', async (req: Request, res: Response): Promise<void> => {
  return getBranchById(req, res);
});

// branches , packages, subjects and roles -> admin routes
// return only id and name in normal get routes

/**
 * @swagger
 * /api/v3/admin/branches:
 *   get:
 *     tags: [Branch Management]
 *     summary: Get all branches
 *     responses:
 *       200:
 *         description: A list of branch objects
 */
// Get all branches
router.get('/', async (req: Request, res: Response): Promise<void> => {
  return getAllBranchesIdName(req, res);
});

/**
 * @swagger
 * /api/v3/admin/branches:
 *   post:
 *     tags: [Branch Management]
 *     summary: Create a new branch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Branch'
 *     responses:
 *       201:
 *         description: The created branch object
 */
// Create a new branch
router.post('/', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return createBranch(req, res);
});

/**
 * @swagger
 * /api/v3/admin/branches/{branch_id}:
 *   delete:
 *     tags: [Branch Management]
 *     summary: Delete a branch by ID
 *     parameters:
 *       - in: path
 *         name: branch_id
 *         required: true
 *         description: The ID of the branch to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Branch deleted successfully
 */
router.delete('/:branch_id', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return deleteBranch(req, res);
});
/**
 * @swagger
 * /api/v3/admin/branches:
 *   put:
 *     tags: [Branch Management]
 *     summary: Update a branch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBranch'
 *     responses:
 *       202:
 *         description: The updated branch object
 */
// Update a branch
router.put('/:branch_id', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return editBranch(req, res);
});

export default router;
