import express, { Request, Response } from 'express';
import { STATUS_CODES } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';

const router = express.Router();

router.post('', async (req: Request, res: Response): Promise<void> => {
  const body: QnaFormResponse = req.body;
  if (!body.questions || !body.email) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Email and Questions Required", null));
    return;
  }


});

export default router;
