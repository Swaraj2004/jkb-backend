import express from 'express';
import { createProfessorLectures, deleteProfessorLectures, getProfessorLectures, getProfessorSubjects, updateProfessorLectures } from '../controllers/professorController';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { PROFESSOR_ROLE } from '../utils/consts';
import { BASE_URLS } from '../swagger/swaggerConfig';

const router = express.Router();
const BASE_URL = BASE_URLS.PROFESSOR;

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
router.get('/subjects', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req, res) => {
  return getProfessorSubjects(req, res);
});

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
router.get('/lectures', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req, res) => {
  const professorId = req.query.professor_id as string;
  return getProfessorLectures(req, res, professorId);
});

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
router.put('/lectures', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req, res) => {
  return updateProfessorLectures(req, res);
});

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
router.post('/lectures', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req, res) => {
  return createProfessorLectures(req, res);
});

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
router.delete('/lectures/:lecture_id', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), async (req, res) => {
  return deleteProfessorLectures(req, res);
});

export default router;
