import express, { Request, Response } from 'express';
import { BranchFormResponse, QnaFormResponse } from '../models/miscellaneous_req_bodies';
import { createContactEnquiry, getContactEnquiry, getCarrerPrediction, getBranchPrediction } from '../controllers/miscellaneousController';
import { ContactEnquiryReqBody } from '../models/contact_enquiry_req_body';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/qna', (req: Request, res: Response): Promise<void> => {
  const body: QnaFormResponse = req.body;
  return getCarrerPrediction(req, res, body, false);
});

// router.post('/qna-email', (req: Request, res: Response): Promise<void> => {
//   const body: QnaFormResponse = req.body;
//   return getCarrerPrediction(req, res, body, true);
// });

router.post('/contact-enquiries', (req: Request, res: Response): Promise<void> => {
  const body: ContactEnquiryReqBody = req.body;
  return createContactEnquiry(req, res, body);
});

router.get('/admin/contact-enquiries', authMiddleware, authorizeRoles(), (req: Request, res: Response): Promise<void> => {
  const { limit, offset } = req.query;
  return getContactEnquiry(req, res, limit as string, offset as string);
});

router.post('/branch-predictor', (req: Request, res: Response): Promise<void> => {
  const body: BranchFormResponse = req.body;
  return getBranchPrediction(req, res, body, false);
});

// router.post('/branch-predictor-email', (req: Request, res: Response): Promise<void> => {
//   const body: BranchFormResponse = req.body;
//   return getBranchPrediction(req, res, body, true);
// });

export default router;
