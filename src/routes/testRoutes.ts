import express, { Request, Response } from 'express';
import { createQuestion, createTest, deleteTest, getQuestions, getTests, updateQuestion, updateTest, deleteQuestion, getSubmissions, getSubjectTests, saveStudentSubmissions, getUserScore, endTest, startTest, endTestSubmission, getTestStatus } from '../controllers/testController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE } from '../utils/consts';
import { TestSubmissionReqBody } from '../models/test_submission_req_body';

const router = express.Router();

// For Test GET,POST,PUT,DELETE
router.get('/subject/tests', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { subject_id, user_id } = req.query;
  return getSubjectTests(req, res, subject_id as string, user_id as string);
});

router.get('/professor/tests', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { professor_id } = req.query;
  return getTests(req, res, professor_id as string);
});

router.get('/professor/test/status/:test_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const { test_id } = req.params;
  return getTestStatus(req, res, test_id);
});

router.post('/professor/test', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const professorId = req.user!.user_id;
  return createTest(req, res, professorId);
});

router.put('/professor/test/:test_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return updateTest(req, res, req.params.test_id);
});

router.put('/professor/test/start/:test_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return startTest(req, res, req.params.test_id);
});

router.put('/professor/test/end/:test_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return endTest(req, res, req.params.test_id);
});

router.delete('/professor/tests/:test_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return deleteTest(req, res, req.params.test_id);
});


// For Questions GET,POST,PUT,DELETE
router.get('/test/:test_id/questions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  return getQuestions(req, res, req.params.test_id);
});

router.post('/test/questions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return createQuestion(req, res);
});

router.put('/test/questions/:question_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return updateQuestion(req, res, req.params.question_id);
});

router.delete('/test/questions/:question_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return deleteQuestion(req, res, req.params.question_id);
});


// For Test Submissions : GET,POST,PUT
router.get('/test/:test_id/submissions', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE]), (req: Request, res: Response): Promise<void> => {
  return getSubmissions(req, res, req.params.test_id);
});

router.post('/test/save', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  const testSubmission: TestSubmissionReqBody = req.body;
  return saveStudentSubmissions(req, res, testSubmission);
});

router.post('/test/submit/:test_submission_id', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: Request, res: Response): Promise<void> => {
  return endTestSubmission(req, res, req.params.test_submission_id);
});


router.get('/test/score', authMiddleware, authorizeRoles([ADMIN_ROLE, PROFESSOR_ROLE, STUDENT_ROLE]), (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { test_submission_id, user_id } = req.query;
  return getUserScore(req, res, test_submission_id as string, user_id as string);
});


export default router;
