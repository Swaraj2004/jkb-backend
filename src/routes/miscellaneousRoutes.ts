import express, { Request, Response } from 'express';
import { QnaFormResponse } from '../models/qna_req_body';
import { createContactEnquiry, getContactEnquiry, getGeminiResponse } from '../controllers/miscellaneousController';
import { ContactEnquiryReqBody } from '../models/contact_enquiry_req_body';

const router = express.Router();

router.post('/career-enquiry', (req: Request, res: Response): Promise<void> => {
  const body: QnaFormResponse = req.body;
  return getGeminiResponse(req, res, body);
});

router.post('/contact-enquiries', (req: Request, res: Response): Promise<void> => {
  const body: ContactEnquiryReqBody = req.body;
  return createContactEnquiry(req, res, body);
});

router.get('/contact-enquiries', (req: Request, res: Response): Promise<void> => {
  const body: ContactEnquiryReqBody = req.body;
  return getContactEnquiry(req, res, body);
});

export default router;
