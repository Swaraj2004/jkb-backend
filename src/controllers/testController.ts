import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES, STUDENT_ROLE } from '../utils/consts';
import { prismaClient } from '../utils/database';
import { TestRequestBody, TestStatus } from '../models/test_req_body';
import { Question } from '../models/testQuestion_req_body';
import { TestSubmissionReqBody } from '../models/test_submission_req_body';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// ====== Tests ======
export const getTests = async (req: Request, res: Response, professor_id: string): Promise<void> => {
  try {
    if (!professor_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Professor Id required", null));
      return;
    }

    const tests = await prismaClient.test.findMany({ where: { user_id: professor_id } });

    if (tests.length === 0) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("No Test found related to the professor_id", null));
      return;
    }

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Test fetched Succesfully!", tests));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

// Get test using subject_id
export const getSubjectTests = async (req: Request, res: Response, subject_id: string, user_id: string): Promise<void> => {
  try {
    if (!subject_id || !user_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Subject Id and user id required", null));
      return;
    }

    const tests = await prismaClient.test.findMany({
      where: {
        subject_id: subject_id,
        test_status: { not: TestStatus.Scheduled },
      },
      select: {
        id: true, title: true, test_status: true, test_timestamp: true, total_time: true,
        testSubmissions: {
          where: { user_id: user_id, },
          select: { score: true, is_submitted: true }
        }
      }
    });

    if (tests.length == 0) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("No Test found related to the subject_id", null));
      return;
    }

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Test fetched Succesfully!", tests));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const createTest = async (req: Request, res: Response, professorId: string): Promise<void> => {
  try {
    const { title, start_time, subject_id, test_duration }: TestRequestBody = req.body;
    if (!title || !subject_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Request Body not complete.", null));
      return;
    }

    const startTime = start_time ? new Date(start_time) : new Date();

    if (start_time && isNaN(startTime.getTime())) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid start_time format.", null));
      return;
    }
    if (start_time && startTime.getTime() < Date.now()) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Start time cannot be in the past.", null));
      return;
    }

    const test = await prismaClient.test.create({
      data: {
        user_id: professorId,
        subject_id: subject_id,
        title: title,
        test_timestamp: startTime,
        total_time: test_duration ?? undefined,
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
    if (reqBody.test_status && !Object.values(TestStatus).includes(reqBody.test_status)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Send valid test_status.", null));
      return;
    }
    const start_time = reqBody.start_time;
    const startTime = start_time ? new Date(start_time) : new Date();

    if (start_time && isNaN(startTime.getTime())) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid start_time format.", null));
      return;
    }
    if (start_time && startTime.getTime() < Date.now()) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Start time cannot be in the past.", null));
      return;
    }

    await prismaClient.test.update({
      where: { id: testId },
      data: {
        title: reqBody.title ?? undefined,
        subject_id: reqBody.subject_id ?? undefined,
        test_timestamp: reqBody.start_time ? startTime : undefined,
        total_time: reqBody.test_duration ?? undefined,
        test_status: reqBody.test_status ?? undefined,
      }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Updated Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const startTest = async (req: Request, res: Response, testId: string): Promise<void> => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }
    await prismaClient.test.update({
      where: { id: testId },
      data: {
        test_status: TestStatus.InProgress,
        test_timestamp: new Date(),
      },
      select: { id: true }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Started Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const endTest = async (req: Request, res: Response, testId: string): Promise<void> => {
  try {
    if (!testId) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Id required", null));
      return;
    }
    await prismaClient.test.update({
      where: { id: testId },
      data: { test_status: TestStatus.Completed, }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Ended Succesfully!", 1));
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

    res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Test Deleted Succesfully!", 1));
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
      select: {
        id: true,
        question_text: true,
        marks: true,
        options: {
          select: {
            id: true,
            option_text: true,
          }
        }
      }
    });
    if (!questionOptions) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Question Not found", null));
      return;
    }
    // console.log(questionOptions, testId);

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
        question_text: reqBody.question_text,
        marks: marks,
        options: {
          createMany: {
            data: reqBody.options.map((option) => ({
              option_text: option.option_text,
              is_correct: option.is_correct,
            })),
          },
        }
      },
      select: { id: true }
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Question and Its Options Created Succesfully!", question.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const updateQuestion = async (req: Request, res: Response, questionId: string): Promise<void> => {
  if (!questionId) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Question Id required", null));
    return;
  }
  try {
    const reqBody: Question = req.body;

    let marks: number | undefined = undefined;
    if (reqBody.question_marks) {
      marks = parseInt(reqBody.question_marks);
      if (isNaN(marks)) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Question Marks should be a Number", null));
        return;
      }
    }

    if (!reqBody.options || reqBody.options.length === 0) {
      await prismaClient.testQuestion.update({
        where: { id: questionId },
        data: {
          question_text: reqBody.question_text ?? undefined,
          marks,
        }
      });
    } else {
      await prismaClient.testQuestion.update({
        where: { id: questionId },
        data: {
          question_text: reqBody.question_text ?? undefined,
          marks: marks,
          options: {
            deleteMany: {},  // first delete all the options before so as to avoid repetition
            createMany: {
              data: reqBody.options.map((option) => ({
                option_text: option.option_text,
                is_correct: option.is_correct,
              })),
            }
          }
        }
      });
    }

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Question updated successfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const deleteQuestion = async (req: Request, res: Response, questionId: string): Promise<void> => {
  if (!questionId) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Question Id required", null));
    return;
  }
  try {
    // questionOptions will be deleted via onDetele:Cascade
    await prismaClient.testQuestion.delete({ where: { id: questionId }, });

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

    const testSubmissions = await prismaClient.testSubmission.findMany({
      where: { test_id: testId },
      select: {
        id: true,
        user_id: true,
        score: true,
        user: {
          select: { full_name: true, }
        },
      },
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Test Submission Found Succesfully!", testSubmissions));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const saveStudentSubmissions = async (req: Request, res: Response, testSubmissionReqBody: TestSubmissionReqBody): Promise<void> => {
  try {
    const { test_id, user_id, answer } = testSubmissionReqBody;
    if (!test_id || !user_id || !Array.isArray(answer)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid request body", null));
      return;
    }
    // take test_id, user_id from frontend
    // if they not have then they send test_id and user_id
    // i have to save the submission if 
    //    - if test_status !== TestStatus.InProgress 
    //    - test_timestamp + total_time > Date.now()
    // else  send the respective response

    let test = await prismaClient.test.findUnique({
      where: { id: test_id },
      select: {
        test_status: true,
        test_timestamp: true,
        total_time: true,
        testSubmissions: {
          where: { user_id },
          select: { id: true, is_submitted: true }
        }
      }
    });

    if (!test) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test with given test_id does not exist.", null));
      return;
    }
    // WARN: below condition should never occur logically
    if (!test.test_timestamp) {
      res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("The test_timestamp is missing.", null));
      return;
    }
    const now = Date.now();
    const startTime = test.test_timestamp.getTime();
    const endTime = startTime + test.total_time * 60 * 1000;
    if (startTime > now) {
      res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Test has not started yet.", null));
      return;
    }
    if (endTime < now) {
      res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Test is ended, time is over.", null));
      return;
    }
    if (test.test_status !== TestStatus.InProgress) {
      res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Test is not in progress.", null));
      return;
    }

    // technically this should never occur replace with logger when implementing logs
    if (test.testSubmissions.length > 1) {
      res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("User cannot have multiple testSubmission.", null));
      return;
    }

    let testSubmission: { id: string; is_submitted: boolean; } | null = null;

    if (test.testSubmissions.length === 0) {
      testSubmission = await prismaClient.testSubmission.create({
        data: {
          test_id,
          user_id,
        },
        select: { id: true, is_submitted: true },
      });
    } else {
      testSubmission = test.testSubmissions[0]; // as the length of the testSubmission is 1

      if (testSubmission.is_submitted) {
        res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Submission is already finalized.", null));
        return;
      }
    }

    const questionIds = answer.map((a): string => a.question_id);

    // NOTE: if transaction does not work remove this
    // TODO: find a way to improve below implementation using prisma docs
    await prismaClient.$transaction([
      // Delete previous answers for only the submitted question IDs
      prismaClient.testSubmissionAnswer.deleteMany({
        where: {
          test_submission_id: testSubmission.id,
          question_id: { in: questionIds },
        },
      }),
      //Add new answers
      prismaClient.testSubmissionAnswer.createMany({
        data: answer.map((a) => ({
          test_submission_id: testSubmission.id,
          question_id: a.question_id,
          selected_option_id: a.selected_option_id,
        })),
      }),
    ]);

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Submission Saved Succesfully!", testSubmission.id));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

export const endTestSubmission = async (req: Request, res: Response, test_submission_id: string): Promise<void> => {
  if (!test_submission_id) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Submission Id required.", null));
    return;
  }
  try {
    const testSubmission = await prismaClient.testSubmission.findFirst({
      where: { id: test_submission_id },
      select: {
        answers: {
          select: { selected_option_id: true, question_id: true }
        },
        test: {
          select: {
            testQuestions: {
              select: {
                id: true,
                marks: true,
                options: {
                  select: { is_correct: true, id: true, }
                }
              }
            }
          }
        },
      }
    });

    if (!testSubmission) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("No submission of the student found.", null));
      return;
    }

    let score = 0;

    // map of correct answers
    const correctMap = new Map<string, Set<string>>();
    for (const question of testSubmission.test.testQuestions) {
      const correctSet = new Set<string>();
      for (const opt of question.options) {
        if (opt.is_correct)
          correctSet.add(opt.id);
      }
      correctMap.set(question.id, correctSet);
    }

    // map of the student’s selections
    const answerMap = new Map<string, Set<string>>();
    for (const studentAnswer of testSubmission.answers) {
      const qid = studentAnswer.question_id;
      const oid = studentAnswer.selected_option_id;

      if (!answerMap.has(qid)) {
        answerMap.set(qid, new Set());
      }

      answerMap.get(qid)!.add(oid);
    }

    //  Compute the score 
    for (const question of testSubmission.test.testQuestions) {
      const correctAnswer = correctMap.get(question.id)!;
      const studentAnswer = answerMap.get(question.id);

      if (studentAnswer && setsAreEqual(correctAnswer, studentAnswer)) {
        score += question.marks;
      }
    }

    await prismaClient.testSubmission.update({
      where: { id: test_submission_id },
      data: { is_submitted: true, score: score }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Test Submission Ended Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};


export const getUserScore = async (req: AuthenticatedRequest, res: Response, test_submission_id: string, studentId?: string): Promise<void> => {
  try {
    if (!test_submission_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test Submission Id required in URL params", null));
      return;
    }
    const user = req.user!;
    const role = user.role_name;

    if (role === STUDENT_ROLE) {
      if (!studentId || studentId !== user.user_id) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Students can only view their own scores.", null));
        return;
      }
    }

    const testSubmission = await prismaClient.testSubmission.findUnique({
      where: { id: test_submission_id },
      select: { score: true },
    });

    if (!testSubmission) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Test submission not found.", null));
      return;
    }

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Score calculated Succesfully!", testSubmission.score));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal Server Error", error instanceof Error ? error.message : error));
  }
};

function setsAreEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const val of a) {
    if (!b.has(val)) return false;
  }
  return true;
}
