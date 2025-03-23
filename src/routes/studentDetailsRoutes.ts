import express, { Request, Response } from 'express';
import { errorJson } from '../utils/common_funcs';
import { createStudentDetails, deleteStudentDetails, editStudentDetails, getAllStudentDetails, getStudentDetailById } from '../controllers/studentDetailsController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { AUTH_ROLES, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Student Management
 *     description: Operations related to student management
 */

/**
 * @swagger
 * /student-details/{student_id}:
 *   get:
 *     tags: [Student Management]
 *     summary: Get a specific student record by ID
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the user to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single student record object
 */
router.get('/:student_id', authMiddleware, authorizeRoles([STUDENT_ROLE, PROFESSOR_ROLE]), async (req:AuthenticatedRequest, res:Response) => {
    if(!req.user || (!AUTH_ROLES.includes(req.user?.role_name) && req.user?.role_name != PROFESSOR_ROLE && req.user?.id != req.params.student_id)){
        res.status(403).json(errorJson("Unauthorized", null));
        return;
    }
    return getStudentDetailById(req, res);
});

/**
 * @swagger
 * /student-details:
 *   get:
 *     tags: [Student Management]
 *     summary: Get all student records with optional year filter
 *     parameters:
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter students by creation date
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of student record objects
 */
router.get('/',authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req, res) => {
    return getAllStudentDetails(req, res);
});

/**
 * @swagger
 * /student-details:
 *   post:
 *     tags: [Student Management]
 *     summary: Create a new student record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentDetail'
 *     responses:
 *       201:
 *         description: The created student record object
 */
router.post('/', async (req: Request, res: Response) => {
    return createStudentDetails(req, res);
});

/**
 * @swagger
 * /student-details/{student_detail_id}:
 *   delete:
 *     tags: [Student Management]
 *     summary: Delete a student record by ID
 *     parameters:
 *       - in: path
 *         name: student_detail_id
 *         required: true
 *         description: The ID of the student detail to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Student record deleted successfully
 */
router.delete('/:student_id', authMiddleware, authorizeRoles(), async (req, res) => {
    return deleteStudentDetails(req, res);
});

/**
 * @swagger
 * /student-details:
 *   put:
 *     tags: [Student Management]
 *     summary: Update a student record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentDetail'
 *     responses:
 *       202:
 *         description: The updated student record object
 */
router.put('/', authMiddleware, authorizeRoles(), async (req:Request, res:Response) => {
    return editStudentDetails(req, res);
});

export default router;
