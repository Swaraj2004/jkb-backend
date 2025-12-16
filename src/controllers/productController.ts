import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES } from '../utils/consts';

export const getProducts = (req: Request, res: Response) => {
  res.json([
    { id: 101, name: 'Laptop' },
    { id: 102, name: 'Phone' },
  ]);
};

// NOTE: reusing productController as requested for batch handlers (professor scope)

export async function getProfessorBatches(
  req: Request,
  res: Response,
  professorId: string
): Promise<void> {
  try {
    const batches = await prismaClient.batchProfessor.findMany({
      where: { professor_id: professorId },
      include: {
        batch: {
          select: { id: true, name: true, subject_id: true, created_at: true },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Batches fetched successfully', batches));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

export async function getStudentBatches(
  req: Request,
  res: Response,
  studentId: string
): Promise<void> {
  try {
    if (!studentId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('student_id required', null));
      return;
    }

    const studentBatches = await prismaClient.studentBatch.findMany({
      where: { student_id: studentId },
      select: { batch: true },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(
        successJson('Student Batches fetched successfully', studentBatches)
      );
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

export async function createProfessorBatch(
  req: Request,
  res: Response,
  professorId: string
): Promise<void> {
  try {
    const { subject_id, name } = req.body;

    if (!subject_id || !name) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('subject_id and name are required', null));
      return;
    }

    const batch = await prismaClient.batch.create({
      data: {
        subject_id: subject_id,
        name: name,
        batchProfessors: {
          create: {
            professor_id: professorId,
          },
        },
      },
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Batch created successfully', batch));
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

export async function updateProfessorBatch(
  req: Request,
  res: Response,
  professorId: string
): Promise<void> {
  try {
    const { batch_id, name, student_ids } = req.body;
    if (!batch_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('batch_id are required', null));
      return;
    }
    if (!name && !student_ids) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson(
            'At least one of `name` or `student_ids` must be provided',
            null
          )
        );
      return;
    }
    if (student_ids !== undefined && !Array.isArray(student_ids)) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('student_ids must be an array of student IDs', null));
      return;
    }

    const access = await prismaClient.batchProfessor.findUnique({
      where: { batch_id_professor_id: { batch_id, professor_id: professorId } },
    });
    if (!access) {
      res
        .status(STATUS_CODES.FORBIDDEN_REQUEST)
        .json(errorJson('You are not assigned to this batch', null));
      return;
    }

    await prismaClient.batch.update({
      where: { id: batch_id },
      data: {
        name,
        studentBatches: student_ids
          ? {
              deleteMany: { batch_id },
              createMany: {
                data: student_ids.map((student_id: string) => ({
                  student_id,
                })),
              },
            }
          : undefined,
      },
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Batch updated successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

export async function deleteProfessorBatch(
  req: Request,
  res: Response,
  professorId: string
): Promise<void> {
  try {
    const { batch_id } = req.body;
    if (!batch_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('batch_id is required', null));
      return;
    }

    const access = await prismaClient.batchProfessor.findUnique({
      where: { batch_id_professor_id: { batch_id, professor_id: professorId } },
    });
    if (!access) {
      res
        .status(STATUS_CODES.FORBIDDEN_REQUEST)
        .json(errorJson('You are not assigned to this batch', null));
      return;
    }

    await prismaClient.batch.delete({ where: { id: batch_id } });

    res
      .status(STATUS_CODES.DELETE_SUCCESS)
      .json(successJson('Batch deleted successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.DELETE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}
