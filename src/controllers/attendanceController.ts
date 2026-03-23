import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import {
  ADMIN_ROLE,
  PROFESSOR_ROLE,
  STUDENT_ROLE,
  SUPER_ADMIN_ROLE,
  STATUS_CODES,
} from '../utils/consts';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

async function resolveStudentDetailId(
  req: AuthenticatedRequest,
  studentIdFromClient?: string
): Promise<string | null> {
  const role = req.user?.role_name;
  if (role === STUDENT_ROLE) {
    // Contract: student_id = StudentDetail.id, but JWT has user_id.
    const studentDetail = await prismaClient.studentDetail.findUnique({
      where: { user_id: req.user!.user_id },
      select: { id: true },
    });
    return studentDetail?.id ?? null;
  }

  // ADMIN/SUPER_ADMIN/PROFESSOR can look up by client-provided StudentDetail.id
  if (
    role === ADMIN_ROLE ||
    role === SUPER_ADMIN_ROLE ||
    role === PROFESSOR_ROLE
  ) {
    return studentIdFromClient ?? null;
  }

  return null;
}

async function isStudentEnrolledInBatch(
  studentDetailId: string,
  batchId: string
): Promise<boolean> {
  const enrollment = await prismaClient.studentBatch.findFirst({
    where: { student_id: studentDetailId, batch_id: batchId },
    select: { student_id: true },
  });
  return !!enrollment;
}

async function isProfessorAssignedToBatch(
  professorId: string,
  batchId: string
): Promise<boolean> {
  const access = await prismaClient.batchProfessor.findFirst({
    where: { professor_id: professorId, batch_id: batchId },
    select: { professor_id: true },
  });
  return !!access;
}

export async function getLectureAttendance(
  req: AuthenticatedRequest,
  res: Response,
  lectureId: string
): Promise<void> {
  try {
    if (!lectureId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('lectureId is required', null));
      return;
    }

    const lecture = await prismaClient.lecture.findUnique({
      where: { id: lectureId },
      select: { id: true, professor_id: true, batch_id: true },
    });

    if (!lecture) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Lecture not found', null));
      return;
    }

    // Professors can only access attendance of lectures they own.
    if (req.user?.role_name === PROFESSOR_ROLE) {
      if (lecture.professor_id !== req.user.user_id) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: lecture does not belong to you', null));
        return;
      }
    }

    // find students in the batch
    const students = await prismaClient.batch.findUnique({
      where: { id: lecture.batch_id },
      select: {
        studentBatches: {
          select: {
            student: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    full_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const presentAttendance = await prismaClient.attendance.findMany({
      where: { lecture_id: lectureId },
      select: { student_id: true },
    });

    const presentStudentIds = new Set(
      presentAttendance.map((a) => a.student_id)
    );

    const batchStudents = students?.studentBatches ?? [];

    const studentAttendance = batchStudents.map(({ student }) => ({
      // Contract: Attendance.student_id = StudentDetail.id
      student_id: student.id,
      student_name: student.user?.full_name || 'Unknown',
      present: presentStudentIds.has(student.id),
    }));

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Records fetched successfully', studentAttendance));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export async function getStudentBatches(
  req: AuthenticatedRequest,
  res: Response,
  studentId: string
) {
  try {
    const role = req.user?.role_name;
    const resolvedStudentDetailId =
      role === STUDENT_ROLE
        ? await resolveStudentDetailId(req, undefined)
        : await resolveStudentDetailId(req, studentId);

    if (!resolvedStudentDetailId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('StudentId not found or invalid', null));
      return;
    }

    const studentBatches = await prismaClient.studentDetail.findUnique({
      where: { id: resolvedStudentDetailId },
      select: {
        studentBatches: {
          select: {
            batch: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(
        successJson('Attendance records retrieved successfully', studentBatches)
      );
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export async function getStudentBatchAttendance(
  req: AuthenticatedRequest,
  res: Response,
  studentId: string,
  batchId: string
) {
  try {
    if (!batchId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('batch_id required', null));
      return;
    }

    const resolvedStudentDetailId =
      (await resolveStudentDetailId(req, studentId)) ?? null;

    if (!resolvedStudentDetailId) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Student record not found', null));
      return;
    }

    const batch = await prismaClient.batch.findUnique({
      where: { id: batchId },
      select: {
        name: true,
        lectures: {
          orderBy: { created_at: 'desc' },
          include: {
            attendance: {
              where: { student_id: resolvedStudentDetailId },
              select: { lecture_id: true },
            },
            professor: {
              select: { full_name: true },
            },
          },
        },
      },
    });

    if (!batch) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Batch not found', null));
      return;
    }

    // Students can only see their own batches.
    if (req.user?.role_name === STUDENT_ROLE) {
      const enrolled = await isStudentEnrolledInBatch(
        resolvedStudentDetailId,
        batchId
      );
      if (!enrolled) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: not enrolled in this batch', null));
        return;
      }
    }

    // If professor views, keep access limited to batches they are assigned to.
    if (req.user?.role_name === PROFESSOR_ROLE) {
      const ok = await isProfessorAssignedToBatch(req.user.user_id, batchId);
      if (!ok) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: not assigned to this batch', null));
        return;
      }
    }

    const lecturesAttendance = batch.lectures.map((lecture) => ({
      lecture_id: lecture.id,
      lecture_mode: lecture.lecture_mode,
      professor_name: lecture.professor.full_name,
      attendance_toggle: lecture.attendance_toggle,
      status: lecture.attendance.length > 0 ? 'present' : 'absent',
      created_at: lecture.created_at,
    }));

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(
        successJson(
          'Attendance records retrieved successfully',
          lecturesAttendance
        )
      );
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export async function markAttendance(
  req: AuthenticatedRequest,
  res: Response,
  lectureId: string,
  studentId: string
) {
  try {
    if (!lectureId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('LectureId required', null));
      return;
    }

    const lecture = await prismaClient.lecture.findUnique({
      where: { id: lectureId },
      select: {
        id: true,
        attendance_toggle: true,
        professor_id: true,
        batch_id: true,
      },
    });

    if (!lecture) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Lecture not found', null));
      return;
    }

    if (!lecture.attendance_toggle) {
      res
        .status(STATUS_CODES.FORBIDDEN_REQUEST)
        .json(errorJson('Attendance is closed for this lecture', null));
      return;
    }

    const resolvedStudentDetailId = await resolveStudentDetailId(
      req,
      studentId
    );

    if (!resolvedStudentDetailId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Invalid student_id', null));
      return;
    }

    // Professors can mark only for lectures they own.
    if (req.user?.role_name === PROFESSOR_ROLE) {
      if (lecture.professor_id !== req.user.user_id) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: lecture does not belong to you', null));
        return;
      }
    }

    // Validate student is enrolled in lecture's batch.
    const enrolled = await isStudentEnrolledInBatch(
      resolvedStudentDetailId,
      lecture.batch_id
    );
    if (!enrolled) {
      res
        .status(STATUS_CODES.FORBIDDEN_REQUEST)
        .json(errorJson('Forbidden: not enrolled in this lecture batch', null));
      return;
    }

    // Idempotent marking: if attendance row already exists, return success.
    const existing = await prismaClient.attendance.findFirst({
      where: { lecture_id: lectureId, student_id: resolvedStudentDetailId },
      select: { lecture_id: true, student_id: true },
    });

    if (existing) {
      res
        .status(STATUS_CODES.CREATE_SUCCESS)
        .json(successJson('Attendance already marked', existing.lecture_id));
      return;
    }

    const attendance = await prismaClient.attendance.create({
      data: {
        lecture_id: lectureId,
        student_id: resolvedStudentDetailId,
      },
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(
        successJson('Attendance Marked Successfully', attendance.lecture_id)
      );
  } catch (error) {
    // const message =
    //   error instanceof Error ? error.message : 'Something went wrong';
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Internal Server error!', null));
  }
}

export async function toggleLectureAttendance(
  req: AuthenticatedRequest,
  res: Response,
  lectureId: string
): Promise<void> {
  try {
    if (!lectureId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('lectureId is required', null));
      return;
    }

    const { attendance_toggle } = req.body as { attendance_toggle?: unknown };
    if (typeof attendance_toggle !== 'boolean') {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('attendance_toggle must be a boolean', null));
      return;
    }

    const lecture = await prismaClient.lecture.findUnique({
      where: { id: lectureId },
      select: { id: true, professor_id: true },
    });

    if (!lecture) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Lecture not found', null));
      return;
    }

    if (req.user?.role_name === PROFESSOR_ROLE) {
      if (lecture.professor_id !== req.user.user_id) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: lecture does not belong to you', null));
        return;
      }
    }

    const updated = await prismaClient.lecture.update({
      where: { id: lectureId },
      data: { attendance_toggle },
      select: { id: true, attendance_toggle: true },
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Lecture attendance toggled successfully', updated));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}

export async function toggleBatchAttendance(
  req: AuthenticatedRequest,
  res: Response,
  batchId: string
): Promise<void> {
  try {
    if (!batchId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('batchId is required', null));
      return;
    }

    const { attendance_toggle } = req.body as { attendance_toggle?: unknown };
    if (typeof attendance_toggle !== 'boolean') {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('attendance_toggle must be a boolean', null));
      return;
    }

    if (req.user?.role_name === PROFESSOR_ROLE) {
      const ok = await isProfessorAssignedToBatch(req.user.user_id, batchId);
      if (!ok) {
        res
          .status(STATUS_CODES.FORBIDDEN_REQUEST)
          .json(errorJson('Forbidden: not assigned to this batch', null));
        return;
      }
    }

    const batchExists = await prismaClient.batch.findUnique({
      where: { id: batchId },
      select: { id: true },
    });

    if (!batchExists) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Batch not found', null));
      return;
    }

    const result = await prismaClient.lecture.updateMany({
      where: { batch_id: batchId },
      data: { attendance_toggle },
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(
      successJson('Batch attendance toggled successfully', {
        batch_id: batchId,
        updated_lectures: result.count,
        attendance_toggle,
      })
    );
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Internal Server Error', null));
  }
}
