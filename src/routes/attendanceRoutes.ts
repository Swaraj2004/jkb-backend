import express, { Request, Response } from 'express';
import {
  AuthenticatedRequest,
  authMiddleware,
  authorizeRoles,
} from '../middlewares/authMiddleware';
import {
  getLectureAttendance,
  getStudentBatchAttendance,
  getStudentBatches,
  toggleBatchAttendance,
  toggleLectureAttendance,
  markAttendance,
} from '../controllers/attendanceController';
import { ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Attendance Management
 *     description: Operations related to attendance management
 */

/**
 * @swagger
 * /api/v3/lectures/{lecture_id}/attendance:
 *   get:
 *     tags: [Attendance Management]
 *     summary: Get attendance for a specific lecture
 *     parameters:
 *       - in: path
 *         name: lecture_id
 *         required: true
 *         description: The ID of the lecture to get attendance for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of student attendance records
 */
router.get(
  '/lectures/:lecture_id/attendance',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    const lectureId = req.params.lecture_id;
    return getLectureAttendance(req, res, lectureId);
  }
);

/**
 * @swagger
 * /api/v3/lectures/{lecture_id}/toggle-attendance:
 *   put:
 *     tags: [Attendance Management]
 *     summary: Toggle attendance for a specific lecture
 *     parameters:
 *       - in: path
 *         name: lecture_id
 *         required: true
 *         description: The ID of the lecture to update
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance toggle updated successfully
 */
router.put(
  '/lectures/:lecture_id/toggle-attendance',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const lectureId = req.params.lecture_id;
    return toggleLectureAttendance(req, res, lectureId);
  }
);

/**
 * @swagger
 * /api/v3/batches/{batch_id}/toggle-attendance:
 *   put:
 *     tags: [Attendance Management]
 *     summary: Toggle attendance for all lectures in a batch
 *     parameters:
 *       - in: path
 *         name: batch_id
 *         required: true
 *         description: The ID of the batch to update
 *         schema:
 *           type: string
 */
// TODO: see if needed
// router.put(
//   '/batches/:batch_id/toggle-attendance',
//   authMiddleware,
//   authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
//   async (req: AuthenticatedRequest, res: Response): Promise<void> => {
//     const batchId = req.params.batch_id;
//     return toggleBatchAttendance(req, res, batchId);
//   }
// );

/**
 * @swagger
 * /api/v3/student/mark-attendance:
 *   post:
 *     tags: [Attendance Management]
 *     summary: Mark attendance for a student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarkAttendance'
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 */
router.post(
  '/student/mark-attendance',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, STUDENT_ROLE, PROFESSOR_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    const { lecture_id, student_id } = req.body;
    return markAttendance(req, res, lecture_id, student_id);
  }
);

/**
 * @swagger
 * /api/v3/student/attendance:
 *   get:
 *     tags: [Attendance Management]
 *     summary: Get attendance records for a specific student
 *     parameters:
 *       - in: query
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get attendance for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of attendance records for the student
 */
router.get(
  '/student/batches',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, STUDENT_ROLE, PROFESSOR_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // if (!req.user) {
    //     res.status(401).json(errorJson("Please log in first", null));
    //     return;
    // }

    // if (
    //     !AUTH_ROLES.includes(req.user.role_name) &&
    //     req.user.role_name !== PROFESSOR_ROLE &&
    //     req.user.id != req.params.user_id
    // ) {
    //     res.status(403).json(errorJson("Unauthorized", null));
    //     return;
    // }

    const studentId = req.query.student_id;
    return getStudentBatches(req, res, studentId as string);
  }
);

router.get(
  '/student/batchAttendance',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, STUDENT_ROLE, PROFESSOR_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const studentId = req.query.student_id;
    const batchId = req.query.batch_id;

    return getStudentBatchAttendance(
      req,
      res,
      studentId as string,
      batchId as string
    );
  }
);

export default router;
