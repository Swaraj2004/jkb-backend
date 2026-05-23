import express, { Request, Response } from 'express';
import {
  BranchFormResponse,
  QnaFormResponse,
} from '../models/miscellaneous_req_bodies';
import {
  createContactEnquiry,
  getContactEnquiry,
  getCarrerPrediction,
  getBranchPrediction,
  createFacebookEnquiry,
  getFacebookEnquiry,
  getQnaEnquiry,
  getBranchEnquiry,
  createLead,
  getLeads,
} from '../controllers/miscellaneousController';
import { LeadReqBody } from '../models/lead_req_body';
import { ContactEnquiryReqBody } from '../models/contact_enquiry_req_body';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { FacebookEnquiryReqBody } from '../models/facebook_enq_req_body';
import { ADMIN_ROLE } from '../utils/consts';

const router = express.Router();

router.post('/qna', (req: Request, res: Response): Promise<void> => {
  const body: QnaFormResponse = req.body;
  return getCarrerPrediction(req, res, body, false);
});
router.get(
  '/admin/qna-enquiries',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    const { limit, offset } = req.query;
    return getQnaEnquiry(req, res, limit as string, offset as string);
  }
);
// router.post('/qna-email', (req: Request, res: Response): Promise<void> => {
//   const body: QnaFormResponse = req.body;
//   return getCarrerPrediction(req, res, body, true);
// });

router.post(
  '/contact-enquiries',
  (req: Request, res: Response): Promise<void> => {
    const body: ContactEnquiryReqBody = req.body;
    return createContactEnquiry(req, res, body);
  }
);

router.get(
  '/admin/contact-enquiries',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    const { limit, offset } = req.query;
    return getContactEnquiry(req, res, limit as string, offset as string);
  }
);

router.post(
  '/branch-predictor',
  (req: Request, res: Response): Promise<void> => {
    const body: BranchFormResponse = req.body;
    return getBranchPrediction(req, res, body, false);
  }
);
router.get(
  '/admin/branch-enquiries',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    const { limit, offset } = req.query;
    return getBranchEnquiry(req, res, limit as string, offset as string);
  }
);

router.post('/leads', (req: Request, res: Response): Promise<void> => {
  const body: LeadReqBody = req.body;
  return createLead(req, res, body);
});
router.get(
  '/leads',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (_req: Request, res: Response): Promise<void> => {
    return getLeads(res);
  }
);

// Facebook enquiry routes
router.post(
  '/facebook-enquiries',
  (req: Request, res: Response): Promise<void> => {
    const body: FacebookEnquiryReqBody = req.body;
    return createFacebookEnquiry(req, res, body);
  }
);
router.get(
  '/admin/facebook-enquiries',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    const { limit, offset } = req.query;
    return getFacebookEnquiry(req, res, limit as string, offset as string);
  }
);

// router.post('/branch-predictor-email', (req: Request, res: Response): Promise<void> => {
//   const body: BranchFormResponse = req.body;
//   return getBranchPrediction(req, res, body, true);
// });

export default router;
