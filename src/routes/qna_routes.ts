import express, { Request, Response } from 'express';
import { QnaFormResponse } from '../models/qna_req_body';
import { getGeminiResponse } from '../controllers/qnaController';

const router = express.Router();

router.post('', async (req: Request, res: Response): Promise<void> => {
  const body: QnaFormResponse = req.body;
  return getGeminiResponse(req, res, body);
});

export default router;
