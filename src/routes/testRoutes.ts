import express, { Request, Response } from 'express';
import { createQuestion, createTest, deleteTest, getQuestions, getTests, updateQuestion, updateTest, deleteQuestion, getSubmissions } from '../controllers/testController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { PROFESSOR_ROLE } from '../utils/consts';

const router = express.Router();

router.get('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { professor_id } = req.query;
  return getTests(req, res, professor_id as string);
});

router.post('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: AuthenticatedRequest, res: Response) => {
  const professorId = req.user!.id;
  return createTest(req, res, professorId);
});

router.put('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { test_id } = req.query;
  return updateTest(req, res, test_id as string);
});

router.delete('/professor/tests', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { test_id } = req.query;
  return deleteTest(req, res, test_id as string);
});

router.get('/professor/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { test_id } = req.query;
  return getQuestions(req, res, test_id as string);
});

router.post('/professor/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  return createQuestion(req, res);
});

router.put('/professor/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { question_id } = req.query;
  return updateQuestion(req, res, question_id as string);
});

router.delete('/professor/test/questions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { question_id } = req.query;
  return deleteQuestion(req, res, question_id as string);
});

router.get('/test/:test_id/submissions', authMiddleware, authorizeRoles([PROFESSOR_ROLE]), (req: Request, res: Response) => {
  const { test_id } = req.params;
  return getSubmissions(req, res, test_id as string);
});

export default router;
