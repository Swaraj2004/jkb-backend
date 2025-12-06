import { Request, Response, NextFunction } from 'express';
import { STATUS_CODES } from '../utils/consts';
import { successJson } from '../utils/common_funcs';
import { PredictByScoreRequest } from '../models/mhai_req_body';
import { prismaClient } from '../utils/database';

// WARN: ask bhaiya about this whether to throw error or not
// function checkScore(score: number): void {
//   if (score < 0 || score > 100) {
//     throw new Error('Invalid score');
//   }
// }

export async function predictCollegesByScore(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reqBody: PredictByScoreRequest = req.body;

    // Validate score
    // checkScore(reqBody.score);

    // Build where clause
    const whereClause: any = {
      year: reqBody.year,
      university_name: reqBody.university,
      branch_name: reqBody.branch,
    };

    let sortingKey: string;

    if (reqBody.exam_type === 'JEE') {
      sortingKey = 'open';
      whereClause[sortingKey] = { lte: reqBody.score };
    } else {
      sortingKey = reqBody.caste;
      whereClause[sortingKey] = { lte: reqBody.score };
    }
    // console.log(whereClause, '\n', sortingKey);
    // Query database
    const colleges = await prismaClient.mhAiCollege.findMany({
      where: whereClause,
      orderBy: {
        [sortingKey]: 'desc',
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Colleges Fetched Successfully', colleges));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Error occured in fetching the colleges', null));
  }
}

export async function predictCollegesByLocation(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { district, year } = req.body;

    // Get distinct college codes
    const distinctCodes = await prismaClient.mhAiCollege.groupBy({
      by: ['college_code'],
      where: {
        location: district,
        year: year,
      },
    });

    const collegeCodes = distinctCodes.map((code) => code.college_code);
    const colleges = await prismaClient.mhAiCollege.findMany({
      where: {
        college_code: {
          in: collegeCodes,
        },
        location: district,
        year: year,
      },
    });
    // console.log(distinctCodes);

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Colleges Fetched Successfully', colleges));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Error occured in fetching the colleges', null));
  }
}
