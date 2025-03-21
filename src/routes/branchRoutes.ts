import express, { Request, Response } from 'express';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { createBranch, deleteBranch, editBranch, getAllBranches, getBranchById } from '../controllers/branchController';

const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Branch Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /branches/{branch_id}:
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
// Get a specific branch by ID
router.get('/:branch_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
  return getBranchById(req, res);
});

/**
 * @swagger
 * /branches:
 *   get:
 *     tags: [Branch Management]
 *     summary: Get all branches
 *     responses:
 *       200:
 *         description: A list of branch objects
 */
// Get all branches
router.get('/', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
  return getAllBranches(req, res);
});

/**
 * @swagger
 * /branches:
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
router.post('/',authMiddleware, authorizeRoles(),async (req: Request, res: Response) => {
  return createBranch(req, res);
});

/**
 * @swagger
 * /branches/{branch_id}:
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
// Delete a branch by ID
router.delete('/:branch_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
  return deleteBranch(req, res);
});
/**
 * @swagger
 * /branches:
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
router.put('/:branch_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
  return editBranch(req, res);
});

export default router;