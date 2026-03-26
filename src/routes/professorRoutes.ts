import express, { Request, Response } from 'express';
import {
  createProfessorLectures,
  deleteProfessorLectures,
  getProfessorLectures,
  getProfessorSubjects,
  updateProfessorLectures,
} from '../controllers/professorController';
import {
  createProfessorBatch,
  deleteProfessorBatch,
  getProfessorBatches,
  updateProfessorBatch,
} from '../controllers/batchController';
import {
  AuthenticatedRequest,
  authMiddleware,
  authorizeRoles,
} from '../middlewares/authMiddleware';
import {
  ADMIN_ROLE,
  PROFESSOR_ROLE,
  STATUS_CODES,
  STUDENT_ROLE,
} from '../utils/consts';
import { errorJson } from '../utils/common_funcs';
import { UpdateProfessorBatchDTO } from '../models/professor_req_body';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Professor Management
 *     description: Admin access only
 */
/**
 * @swagger
 * /api/v3/professor/subjects:
 *   get:
 *     tags: [Professor Management]
 *     summary: Get subjects for a specific professor
 *     parameters:
 *       - in: query
 *         name: professor_id
 *         required: true
 *         description: The ID of the professor to get subjects of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of subjects for the professor
 */
router.get(
  '/subjects',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    return getProfessorSubjects(req, res);
  }
);

/**
 * @swagger
 * /api/v3/professor/lectures:
 *   get:
 *     tags: [Lecture Management]
 *     summary: Get all lectures
 *     description: Retrieve a list of all lectures available in the system.
 *     responses:
 *       200:
 *         description: A list of lecture objects
 */
router.get(
  '/lectures',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    const professorId = req.query.professor_id as string;
    return getProfessorLectures(req, res, professorId);
  }
);

router.get(
  '/batchLectures',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    const batchId = req.query.batch_id as string;
    return getProfessorLectures(req, res, batchId);
  }
);

/**
 * @swagger
 * /api/v3/professor/lectures:
 *   get:
 *     tags: [Professor Management]
 *     summary: Fetch lectures for a specific professor
 *     parameters:
 *       - in: query
 *         name: prof_user_id
 *         required: true
 *         description: The ID of the professor to get lectures for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of lectures for the professor
 */
router.put(
  '/lectures',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    return updateProfessorLectures(req, res);
  }
);

/**
 * @swagger
 * /api/v3/professor/lectures:
 *   post:
 *     tags: [Professor Management]
 *     summary: Add a new lecture
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LectureCreate'
 *     responses:
 *       201:
 *         description: The created lecture object
 */
router.post(
  '/lectures',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    return createProfessorLectures(req, res);
  }
);

/**
 * @swagger
 * /api/v3/professor/lectures/{lecture_id}:
 *   delete:
 *     tags: [Professor Management]
 *     summary: Remove a lecture by ID
 *     parameters:
 *       - in: path
 *         name: lecture_id
 *         required: true
 *         description: The ID of the lecture to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lecture deleted successfully
 */
router.delete(
  '/lectures/:lecture_id',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    return deleteProfessorLectures(req, res);
  }
);

// NOTE: Below everything is for Batch and hence their attendance
function isValidProfessorIdQuery(
  req: AuthenticatedRequest,
  res: Response,
  professorId: string | undefined
): boolean {
  if (!professorId) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json(errorJson('professor_id query param is required', null));
    return false;
  }

  // Prevent professor from requesting someone else.
  if (req.user!.role_name === PROFESSOR_ROLE && req.user!.user_id !== professorId) {
    res
      .status(STATUS_CODES.FORBIDDEN_REQUEST)
      .json(
        errorJson(
          'Forbidden: you are not allowed to access other professors data',
          null
        )
      );
    return false;
  }

  return true;
}

// Get all batches assigned to a professor (admin can query any professor)
router.get(
  '/batches',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const professorId = req.query.professor_id as string | undefined;
    if (!isValidProfessorIdQuery(req, res, professorId)) return;
    return getProfessorBatches(req, res, professorId as string);
  }
);

// Admin creates a new batch WITHOUT assigning professors yet
router.post(
  '/batches',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    return createProfessorBatch(req, res);
  }
);

// Admin updates a batch: set `student_ids` and/or `professor_ids`
router.put(
  '/batches',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  async (
    req: Request<{}, {}, UpdateProfessorBatchDTO>,
    res: Response
  ): Promise<void> => {
    return updateProfessorBatch(req, res);
  }
);

// Admin deletes a batch
router.delete(
  '/batches',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  async (req: Request, res: Response): Promise<void> => {
    return deleteProfessorBatch(req, res);
  }
);

export default router;
