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

export async function createProfessorBatch(
  req: Request,
  res: Response
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
  res: Response
): Promise<void> {
  try {
    const { batch_id, name, student_ids, professor_ids } = req.body;
    if (!batch_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('batch_id are required', null));
      return;
    }

    const hasAnyUpdate =
      name !== undefined || student_ids !== undefined || professor_ids !== undefined;

    if (!hasAnyUpdate) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson(
            'At least one of `name`, `student_ids`, or `professor_ids` must be provided',
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

    if (professor_ids !== undefined && !Array.isArray(professor_ids)) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('professor_ids must be an array of professor IDs', null));
      return;
    }

    await prismaClient.$transaction(async (prisma) => {
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (student_ids !== undefined) {
        updateData.studentBatches = {
          deleteMany: { batch_id },
          createMany: {
            data: student_ids.map((student_id: string) => ({ student_id })),
          },
        };
      }

      await prisma.batch.update({
        where: { id: batch_id },
        data: updateData,
      });

      if (professor_ids !== undefined) {
        await prisma.batchProfessor.deleteMany({ where: { batch_id } });
        await prisma.batchProfessor.createMany({
          data: professor_ids.map((professor_id: string) => ({
            batch_id,
            professor_id,
          })),
          skipDuplicates: true,
        });
      }
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
  res: Response
): Promise<void> {
  try {
    const { batch_id } = req.body;
    if (!batch_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('batch_id is required', null));
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
