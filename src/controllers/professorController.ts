import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import { PROFESSOR_ROLE, STATUS_CODES } from '../utils/consts';
import { LectureCreateDTO } from '../models/professor_req_body';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

/**
 * GET /professor/subjects?professor_id=...
 * Retrieves all subjects associated with a given professor.
 */
export async function getProfessorSubjects(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const professorId = req.query.professor_id as string;
    if (!professorId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Professor ID is required', null));
      return;
    }

    const subjects = await prismaClient.subject.findMany({
      where: {
        subjectProfessors: {
          some: { professor_id: professorId },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Subjects fetched successfully', subjects));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

/**
 * GET /professor/lectures?professor_id=...
 * Retrieves all lectures for a professor including the associated subject info.
 */
export async function getProfessorLectures(
  req: Request,
  res: Response,
  professorId: string
): Promise<void> {
  try {
    if (!professorId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Professor ID is required', null));
      return;
    }

    const lectures = await prismaClient.lecture.findMany({
      where: { professor_id: professorId },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Lectures fetched successfully', lectures));
  } catch (error) {
    // console.error('Error fetching lectures:', error);
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

// get lectures for the given batch_id
export async function getBatchLectures(
  req: Request,
  res: Response,
  batchId: string
): Promise<void> {
  try {
    if (!batchId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Batch ID is required', null));
      return;
    }

    const batchLectures = await prismaClient.batch.findMany({
      where: { id: batchId },
      select: {
        id: true,
        lectures: {
          select: {
            id: true,
            lecture_mode: true,
            attendance_toggle: true,
            professor: {
              select: { full_name: true },
            },
          },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Batch Lectures fetched successfully', batchLectures));
  } catch (error) {
    // console.error('Error fetching lectures:', error);
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

/**
 * POST /professor/lectures
 * Creates a new lecture record.
 */
export async function createProfessorLectures(
  req: Request<{}, {}, LectureCreateDTO>,
  res: Response
): Promise<void> {
  try {
    const lectureData = req.body;

    if (
      !lectureData.subject_id ||
      !lectureData.professor_id ||
      !lectureData.batch_id ||
      !lectureData.lecture_mode
    ) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson(
            'Missing required fields: subject_id, professor_id, batch_id, lecture_mode',
            null
          )
        );
      return;
    }

    // If the caller is a professor, ensure they are assigned to the batch and
    // that they are creating a lecture for themselves (not someone else).
    const role = (req as AuthenticatedRequest).user?.role_name;
    const callerUserId = (req as AuthenticatedRequest).user?.user_id;

    if (role === PROFESSOR_ROLE) {
      if (!callerUserId || lectureData.professor_id !== callerUserId) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: cannot create lecture for others', null));
        return;
      }

      const access = await prismaClient.batchProfessor.findFirst({
        where: {
          batch_id: lectureData.batch_id,
          professor_id: lectureData.professor_id,
        },
        select: { professor_id: true },
      });

      if (!access) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(
            errorJson(
              'Forbidden: professor is not assigned to this batch',
              null
            )
          );
        return;
      }
    }

    const createPayload = {
      professor_id: lectureData.professor_id,
      batch_id: lectureData.batch_id,
      lecture_mode: lectureData.lecture_mode,
      remark: lectureData.remark ?? null,
      attendance_toggle:
        typeof lectureData.attendance_toggle === 'boolean'
          ? lectureData.attendance_toggle
          : true,
    };
    const newLecture = await prismaClient.lecture.create({
      data: createPayload,
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Lecture created successfully', newLecture.id));
  } catch (error) {
    console.log(error);
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

/**
 * PUT /professor/lectures
 * Updates an existing lecture (e.g. updating the attendance toggle).
 */
export async function updateProfessorLectures(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const updatedLecture = req.body;
    if (!updatedLecture.id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Lecture ID is required', null));
      return;
    }

    // TODO: improve this if possible
    const rawValue = updatedLecture.attendance_toggle;
    let attendanceToggle: boolean;

    if (rawValue === true || rawValue === false) {
      attendanceToggle = rawValue;
    } else if (rawValue === 'true') {
      attendanceToggle = true;
    } else if (rawValue === 'false') {
      attendanceToggle = false;
    } else {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('attendance_toggle must be true or false', null));
      return;
    }

    const lecture = await prismaClient.lecture.findUnique({
      where: { id: updatedLecture.id },
      select: { id: true, professor_id: true },
    });

    if (!lecture) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Lecture not found', null));
      return;
    }

    const role = (req as AuthenticatedRequest).user?.role_name;
    const callerUserId = (req as AuthenticatedRequest).user?.user_id;

    // Professors can only toggle lectures they own.
    if (role === PROFESSOR_ROLE) {
      if (!callerUserId || lecture.professor_id !== callerUserId) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: lecture does not belong to you', null));
        return;
      }
    }

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(
      successJson(
        'Lecture updated successfully',
        (
          await prismaClient.lecture.update({
            where: { id: updatedLecture.id },
            data: { attendance_toggle: attendanceToggle },
            select: { id: true, attendance_toggle: true },
          })
        ).id
      )
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson(message, null));
  }
}

/**
 * DELETE /professor/lectures/:lecture_id
 * Deletes a lecture by its ID.
 */
export async function deleteProfessorLectures(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const lectureId = req.params.lecture_id;
    if (!lectureId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Lecture ID is required', null));
      return;
    }

    await prismaClient.lecture.delete({ where: { id: lectureId } });

    res
      .status(STATUS_CODES.DELETE_SUCCESS)
      .json(successJson('Lecture deleted successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.DELETE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}
