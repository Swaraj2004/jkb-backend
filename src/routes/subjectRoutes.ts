import express, { Request, Response } from 'express';
import {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getSubjectUsers,
  getSubjectAttendance,
  getStudentSubjects,
} from '../controllers/subjectController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { ADMIN_ROLE, STUDENT_ROLE } from '../utils/consts';


const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Subject Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /api/v3/student-details/subjects/{subject_id}:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get a specific subject by ID
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single subject object
 */
router.get('/subjects/:subject_id', async (req: Request, res: Response): Promise<void> => {
  return getSubjectById(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/subjects:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get all subjects
 *     responses:
 *       200:
 *         description: A list of subject objects
 */
router.get('/subjects', async (req: Request, res: Response): Promise<void> => {
  return getSubjects(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/subject-users:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get users enrolled in a subject
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         required: false
 *         description: The year to filter by
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of users enrolled in the subject
 */
router.get('/subject-users', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return getSubjectUsers(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/subject-attendance:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get attendance records for a subject
 *     parameters:
 *       - in: query
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance records for the subject
 */
router.get('/subject-attendance', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return getSubjectAttendance(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/student-subjects/{student_id}:
 *   get:
 *     tags: [Subject Management]
 *     summary: Get subjects for a specific student
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get subjects of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of subjects for the student
 */
router.get('/student-subjects/:student_id', authMiddleware, authorizeRoles([ADMIN_ROLE, STUDENT_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return getStudentSubjects(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/subjects:
 *   post:
 *     tags: [Subject Management]
 *     summary: Create a new subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: The created subject object
 */
router.post('/subjects', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return createSubject(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/subjects/{subject_id}:
 *   delete:
 *     tags: [Subject Management]
 *     summary: Delete a subject by ID
 *     parameters:
 *       - in: path
 *         name: subject_id
 *         required: true
 *         description: The ID of the subject to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Subject deleted successfully
 */
router.delete('/subjects/:subject_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response): Promise<void> => {
  return deleteSubject(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/subjects:
 *   put:
 *     tags: [Subject Management]
 *     summary: Update a subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubject'
 *     responses:
 *       202:
 *         description: The updated subject object
 */
router.put('/subjects', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return updateSubject(req, res);
});

export default router;
