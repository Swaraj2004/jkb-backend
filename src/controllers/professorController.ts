import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES } from '../utils/consts';

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
    console.error('Error fetching lectures:', error);
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
  req: Request,
  res: Response
): Promise<void> {
  try {
    const lectureData = req.body;

    const newLecture = await prismaClient.lecture.create({
      data: {
        subject_id: lectureData.subject_id,
        professor_id: lectureData.professor_id,
        lecture_mode: lectureData.lecture_mode,
        remark: lectureData.remark,
        attendance_toggle: lectureData.attendance_toggle,
        created_by: lectureData.professor_id,
      },
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Lecture created successfully', newLecture.id));
  } catch (error) {
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

    await prismaClient.lecture.update({
      where: { id: updatedLecture.id },
      data: { attendance_toggle: updatedLecture.attendance_toggle },
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Lecture updated successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Internal Server Error', null));
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
