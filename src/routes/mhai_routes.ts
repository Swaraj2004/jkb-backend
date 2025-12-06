import express, { Request, Response } from 'express';
import {
  predictCollegesByScore,
  predictCollegesByLocation,
} from '../controllers/mhai_controller';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { ADMIN_ROLE } from '../utils/consts';

const router = express.Router();

router.post(
  '/predict-colleges-by-score',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    return predictCollegesByScore(req, res);
  }
);
router.post(
  '/predict-colleges-by-location',
  authMiddleware,
  authorizeRoles([ADMIN_ROLE]),
  (req: Request, res: Response): Promise<void> => {
    return predictCollegesByLocation(req, res);
  }
);

export default router;
