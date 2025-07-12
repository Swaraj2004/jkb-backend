import express, { Request, Response } from 'express';
import { createQuestion, createTest, deleteTest, getQuestions, getTests, updateQuestion, updateTest, deleteQuestion, getSubmissions, getSubjectTests, saveStudentSubmissions, getUserScore, endTest, startTest } from '../controllers/testController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';
import { TestSubmissionReqBody } from '../models/test_submission_req_body';

const router = express.Router();

// For Test GET,POST,PUT,DELETE
router.get('/subject/tests', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { subject_id } = req.query;
  return getSubjectTests(req, res, subject_id as string);
});

router.get('/professor/tests', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { professor_id } = req.query;
  return getTests(req, res, professor_id as string);
});

router.post('/professor/test', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const professorId = req.user!.user_id;
  return createTest(req, res, professorId);
});

router.put('/professor/test', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return updateTest(req, res, test_id as string);
});

router.put('/professor/test/start', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return startTest(req, res, test_id as string);
});

router.put('/professor/test/end', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return endTest(req, res, test_id as string);
});

router.delete('/professor/tests', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return deleteTest(req, res, test_id as string);
});


// For Questions GET,POST,PUT,DELETE
router.get('/test/questions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.query;
  return getQuestions(req, res, test_id as string);
});

router.post('/test/questions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return createQuestion(req, res);
});

router.put('/test/questions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { question_id } = req.query;
  return updateQuestion(req, res, question_id as string);
});

router.delete('/test/questions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { question_id } = req.query;
  return deleteQuestion(req, res, question_id as string);
});


// For Test Submissions : GET,POST,PUT
router.get('/test/:test_id/submissions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.params;
  return getSubmissions(req, res, test_id as string);
});

router.post('/test/save', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const testSubmission: TestSubmissionReqBody = req.body;
  return saveStudentSubmissions(req, res, testSubmission);
});

router.get('/test/score', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { test_id, user_id } = req.query;
  return getUserScore(req, res, test_id as string, user_id as string);
});


export default router;
