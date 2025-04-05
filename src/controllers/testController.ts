import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES } from '../utils/consts';
import { prismaClient } from '../utils/database';
import { TestRequestBody } from '../models/test_req_body';

// ====== Tests ======
export const getTests = async (req: Request, res: Response, professor_id: string) => {
  try {
    if (!professor_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Professor Id required", null));
      return;
    }

    const tests = await prismaClient.test.findFirst({
      where: { user_id: professor_id }
    });

    if (!tests) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("No Test found related to the professor_id", null));
      return;
    }

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Test fetched Succesfully!", tests));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }

};

export const createTest = async (req: Request, res: Response, professorId: string) => {
  try {
    if (!professorId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Professor Id required", null));
      return;
    }
    const reqBody: TestRequestBody = req.body;
    const test = await prismaClient.test.create({
      data: {
        user_id: professorId,
        subject_id: reqBody.subject_id,
        title: reqBody.title,
      }
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Test created Succesfully", test.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const updateTest = async (req: Request, res: Response, testId: string) => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }
    const reqBody: TestRequestBody = req.body;
    const updatedTest = await prismaClient.test.update({
      where: { id: testId },
      data: {
        title: reqBody.title,
        subject_id: reqBody.subject_id
      }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Updated Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const deleteTest = async (req: Request, res: Response, testId: string) => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }
    await prismaClient.test.delete({ where: { id: testId }, });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Updated Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

// ====== Questions ======
export const getQuestions = async (req: Request, res: Response, testId: string) => {
  // TODO: Implement logic
  try {

  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const createQuestion = async (req: Request, res: Response) => {
  // TODO: Implement logic
  try {

  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const updateQuestion = async (req: Request, res: Response, questionId: string) => {
  // TODO: Implement logic
  try {

  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const deleteQuestion = async (req: Request, res: Response, questionId: string) => {
  // TODO: Implement logic
  try {

  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

// ====== Submissions ======
export const getSubmissions = async (req: Request, res: Response, testId: string) => {
  // TODO: Implement logic
  try {

  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};
