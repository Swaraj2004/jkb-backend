import express, { Request, Response } from 'express';
import { predictCollegesByScore, predictCollegesByLocation } from '../controllers/mhai_controller';
import { authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/predict-colleges-by-score', authMiddleware, authorizeRoles(), (req: Request, res: Response): Promise<void> => {
  return predictCollegesByScore(req, res);
});
router.post('/predict-colleges-by-location', authMiddleware, authorizeRoles(), (req: Request, res: Response): Promise<void> => {
  return predictCollegesByLocation(req, res);
});

export default router;
