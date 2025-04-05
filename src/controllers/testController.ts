import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES } from '../utils/consts';
import { prismaClient } from '../utils/database';
import { TestRequestBody } from '../models/test_req_body';
import { Question } from '../models/testQuestion_req_body';

// ====== Tests ======
export const getTests = async (req: Request, res: Response, professor_id: string): Promise<void> => {
  try {
    if (!professor_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Professor Id required", null));
      return;
    }

    const tests = await prismaClient.test.findMany({
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

export const createTest = async (req: Request, res: Response, professorId: string): Promise<void> => {
  try {
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

export const updateTest = async (req: Request, res: Response, testId: string): Promise<void> => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }
    const reqBody: TestRequestBody = req.body;
    await prismaClient.test.update({
      where: { id: testId },
      data: {
        title: reqBody.title,
        subject_id: reqBody.subject_id
      }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Updated Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const deleteTest = async (req: Request, res: Response, testId: string): Promise<void> => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }
    await prismaClient.test.delete({ where: { id: testId }, });

    res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Test Updated Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

// ====== Questions ======
export const getQuestions = async (req: Request, res: Response, testId: string): Promise<void> => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }

    const questionOptions = await prismaClient.testQuestion.findMany({
      where: { test_id: testId },
      include: { options: true }
      // select: {}     uncomment and add the required features after talking to frontend devs
    });
    if (!questionOptions) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Question Not found", null));
      return;
    }
    console.log(questionOptions, testId);

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Quesion and Options fetched Succesfully!", questionOptions));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqBody: Question = req.body;
    const marks = parseInt(reqBody.question_marks);
    if (isNaN(marks)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Question Marks should be a Number", null));
      return;
    }

    // A good practice to code will be to keep both the creation of Question and the QuesionOptions in a transaction
    // But as we dont know about the transaction policy in Superbase I have not Implemented it
    // prismaClient.$transaction(async (t) => {
    //   write both the below funcions here
    // });
    const question = await prismaClient.testQuestion.create({
      data: {
        test_id: reqBody.test_id,
        question_text: reqBody.question_test,
        marks: marks,
      }
    });

    reqBody.options.forEach(async (option): Promise<void> => {
      await prismaClient.questionOption.create({
        data: {
          question_id: question.id,
          option_text: option.option_text,
          is_correct: option.is_correct
        }
      });
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Question and Its Options Created Succesfully!", question.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const updateQuestion = async (req: Request, res: Response, questionId: string): Promise<void> => {
  // TODO: Implement logic
  try {

  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const deleteQuestion = async (req: Request, res: Response, questionId: string): Promise<void> => {
  try {
    if (!questionId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Question Id required", null));
      return;
    }

    const question = await prismaClient.testQuestion.delete({
      where: { id: questionId },
      include: { options: true }    // as in schema it is configured onDelete:Cascade it will delete all options related to it also
    });
    if (!question) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Question not found!", null));
      return;
    }
    // await prismaClient.questionOption.deleteMany({
    //   where: { question_id: question.id },
    // });

    res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Question and Related options deleted Succesfully!", null));
  } catch (error) {
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

// ====== Submissions ======
export const getSubmissions = async (req: Request, res: Response, testId: string): Promise<void> => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required in URL params", null));
      return;
    }

    const testSubmission = await prismaClient.testSubmission.findMany({
      where: { test_id: testId },
      // select:{},
    });

    res.status(STATUS_CODES.SELECT_FAILURE).json(successJson("Test Submission Found Succesfully!", testSubmission));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};
