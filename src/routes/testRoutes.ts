import express, { Request, Response } from 'express';
import { createQuestion, createTest, deleteTest, getQuestions, getTests, updateQuestion, updateTest, deleteQuestion, getSubmissions, getSubjectTests } from '../controllers/testController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';

const router = express.Router();

// For Test GET,POST,PUT,DELETE
router.get('/subject/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { subject_id } = req.query;
  return getSubjectTests(req, res, subject_id as string);
});

router.get('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { professor_id } = req.query;
  return getTests(req, res, professor_id as string);
});

router.post('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const professorId = req.user!.user_id;
  return createTest(req, res, professorId);
});

router.put('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return updateTest(req, res, test_id as string);
});

router.delete('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return deleteTest(req, res, test_id as string);
});


// For Questions GET,POST,PUT,DELETE
router.get('/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return getQuestions(req, res, test_id as string);
});

router.post('/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return createQuestion(req, res);
});

router.put('/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { question_id } = req.query;
  return updateQuestion(req, res, question_id as string);
});

router.delete('/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { question_id } = req.query;
  return deleteQuestion(req, res, question_id as string);
});


// For Test Submissions : GET,POST,PUT
router.get('/test/:test_id/submissions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.params;
  return getSubmissions(req, res, test_id as string);
});



export default router;
