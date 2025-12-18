import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import { STATUS_CODES } from '../utils/consts';

export async function getLectureAttendance(
  req: Request,
  res: Response,
  lectureId: string
): Promise<void> {
  try {
    const lecture = await prismaClient.lecture.findUnique({
      where: { id: lectureId },
    });

    if (!lecture) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Lecture not found', null));
      return;
    }

    // find students in the batch
    const students = await prismaClient.batch.findUnique({
      where: { id: lecture.batch_id },
      select: {
        studentBatches: {
          select: {
            student: {
              select: {
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

    // Get attendance records for current lecture
    const attendances = await prismaClient.attendance.findMany({
      where: { lecture_id: lectureId },
      select: { student_id: true },
    });
    const presentStudentIds = new Set(attendances.map((a) => a.student_id));

    const studentAttendance = students!.studentBatches.map(({ student }) => ({
      student_id: student.user.id,
      student_name: student.user?.full_name || 'Unknown',
      present: presentStudentIds.has(student.user.id),
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
  req: Request,
  res: Response,
  studentId: string
) {
  try {
    if (!studentId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('StudentId not found', null));
      return;
    }

    const studentBatches = await prismaClient.studentDetail.findUnique({
      where: { user_id: studentId },
      include: {
        // studentSubjects: { select: { subject_id: true } },
        // studentPackages: {
        //   // means collect subject which are enrolled in the packages
        //   include: {
        //     package: {
        //       select: { packageSubjects: true },
        //     },
        //   },
        // },
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
  res: Response,
  studentId: string,
  batchId: string
) {
  try {
    if (!studentId || !batchId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('student_id and batch_id required', null));
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
              where: { student_id: studentId },
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
  req: Request,
  res: Response,
  lectureId: string,
  studentId: string
) {
  try {
    if (!lectureId || !studentId) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('LectureId and StudentId required', null));
      return;
    }

    // NOTE: this can have implication that if no lecture exist then also attendance
    // will be created which will have no effect on current lecture attendance but still a kind of bug
    const attendance = await prismaClient.attendance.create({
      data: {
        lecture_id: lectureId,
        student_id: studentId,
      },
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(
        successJson('Attendance Marked Successfully', attendance.lecture_id)
      );
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}
