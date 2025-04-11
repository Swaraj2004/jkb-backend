import express, { Request, Response } from 'express';
import { predictCollegesByScore, predictCollegesByLocation } from '../controllers/mhai_controller';

const router = express.Router();

router.post('/predict-colleges-by-score', (req: Request, res: Response) => {
    return predictCollegesByScore(req, res);
});
router.post('/predict-colleges-by-location', (req: Request, res: Response) => {
    return predictCollegesByLocation(req, res);
});

export default router;