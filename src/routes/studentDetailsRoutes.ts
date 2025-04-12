import express, { Request, Response } from 'express';
import { createStudentDetails, deleteStudentDetails, editStudentDetails, getAllStudentDetails, getStudentDetailById } from '../controllers/studentDetailsController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';
import { STATUS_CODES } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Student Management
 *     description: Operations related to student management
 */

/**
 * @swagger
 * /api/v3/student-details/{student_id}:
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
router.get('/:student_id', authMiddleware, authorizeRoles([STUDENT_ROLE, PROFESSOR_ROLE]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const studentId = req.params.student_id;
  if (req.user!.role_name === STUDENT_ROLE && studentId !== req.user!.id) {
    res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson("Cannot see Other student Student Detail", null));
    return;
  }
  return getStudentDetailById(req, res, studentId);
});

/**
 * @swagger
 * /api/v3/student-details:
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
router.get('/', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req: Request, res: Response): Promise<void> => {
  return getAllStudentDetails(req, res);
});

/**
 * @swagger
 * /api/v3/student-details:
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
router.post('/', async (req: Request, res: Response): Promise<void> => {
  return createStudentDetails(req, res);
});

/**
 * @swagger
 * /api/v3/student-details/{student_detail_id}:
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
router.delete('/:student_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response): Promise<void> => {
  return deleteStudentDetails(req, res);
});

/**
 * @swagger
 * /api/v3/student-details:
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
router.put('/', authMiddleware, authorizeRoles([STUDENT_ROLE]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (req.user!.role_name === STUDENT_ROLE && req.user!.id !== req.body.student_id) {
    res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson("Current User cannot edit other users Student-Detail", null));
    return;
  }
  return editStudentDetails(req, res);
});

export default router;

// TODO :
// student fees 
// year one filter
// MHai routes
// get subjects mein professor ane chahiye - send res body to bhaiya
// update subject mein array of professorId will be given same as student-detail
// delete subject professor fix also delete SubjectProfessor - this should work
// get Packages uske subjects aane chahiye - send res body to bhaiya

// roles related api, delete student  - Keep for later
// full stop in message
