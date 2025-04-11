import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { STATUS_CODES } from '../utils/consts';
import { SubjectRequestBody } from '../models/subject_req_body';

// Get all subjects
export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const subjects = await prismaClient.subject.findMany({
      include: {
        subjectProfessors: {
          select: {
            professor: {
              select: { id: true, full_name: true }
            }
          }
        }
      }
    });
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Subjects fetched successfully", subjects));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch subjects", error));
  }
}


// Get subject by ID
export async function getSubjectById(req: Request, res: Response): Promise<void> {
  try {
    const { subject_id } = req.params;

    const subject = await prismaClient.subject.findUnique({
      where: { id: subject_id },
      include: {
        subjectProfessors: {
          select: {
            professor: {
              select: { id: true, full_name: true }
            }
          }
        }
      }
    });

    if (!subject) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Subject not found", null));
      return;
    }

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Subject fetched successfully", subject));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch subject", error));
  }
}


// Create a new subject
export async function createSubject(req: Request, res: Response): Promise<void> {
  try {
    const reqBody: SubjectRequestBody = req.body;    // professor_id

    if (!reqBody.name || !reqBody.subject_fees) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Name and Subject Fees are required", null));
      return;
    }

    const subjectId = await prismaClient.$transaction(async (tx): Promise<string> => {
      const subject = await tx.subject.create({
        data: {
          name: reqBody.name,
          subject_fees: reqBody.subject_fees
        }
      });

      // for now there are no checks here but in future there can be bugs like there is an entry in subject but not in SubjectProfessor
      await Promise.all(
        reqBody.professor_user_ids.map((professor_id: string) => {
          return tx.subjectProfessor.create({
            data: {
              professor_id: professor_id,
              subject_id: subject.id
            }
          });
        })
      );

      return subject.id;
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Subject created successfully", subjectId));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Failed to create subject", error));
  }
}

// Update a subject
export async function updateSubject(req: Request, res: Response): Promise<void> {
  try {
    const { id, name, subject_fees } = req.body;

    if (!id || !name || !subject_fees) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("ID, Name, and Subject Fees are required", null));
      return;
    }

    const updatedSubject = await prismaClient.subject.update({
      where: { id },
      data: { name, subject_fees }
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Subject updated successfully", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Failed to update subject", error));
  }
}

export async function deleteSubject(req: Request, res: Response): Promise<void> {
  try {
    const { subject_id } = req.params;

    await prismaClient.subject.delete({ where: { id: subject_id } });

    res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Subject deleted successfully", 1));
  } catch (error) {
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Failed to delete subject", error));
  }
}

// Get users enrolled in subjects
export async function getSubjectUsers(req: Request, res: Response): Promise<void> {
  try {
    const { subject_id, year } = req.query;
    // WARN: here I am not sending the studendtDetail information ask Bhaiya
    if (!subject_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Subject Id or year absent', null));
      return;
    }
    if (!year) {
      const subjectUsers = await prismaClient.user.findMany({
        where: {
          studentDetail: {
            studentSubjects: {
              some: {
                subject_id: subject_id as string,
              },
            },
          },
        },
        select: { email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true }
      });

      res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Subject users fetched successfully", subjectUsers));
      return;
    }

    const numericYear = parseInt(year as string, 10);
    const subjectUsers = await prismaClient.user.findMany({
      where: {
        studentDetail: {
          studentSubjects: {
            some: {
              subject_id: subject_id as string,
              created_at: {
                gte: new Date(`${numericYear}-01-01T00:00:00.000Z`), // Start of the given year
                lt: new Date(`${numericYear + 1}-01-01T00:00:00.000Z`), // Start of the next year
              },
            },
          },
        },
      },
      select: { email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Subject users fetched successfully", subjectUsers));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch subject users", error));
  }
}


export async function getSubjectAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { subject_id } = req.query;
    if (!subject_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Subject Id absent', null));
      return;
    }
    const attendanceRecords = await prismaClient.attendance.findMany({
      where: {
        lecture: { subject_id: subject_id as string }
      },
      // include: {
      //     lecture: {
      //         select: { id: true, subject_id: true, created_at: true }
      //     },
      //     student: {
      //         select: { id: true, full_name: true, email: true }
      //     }
      // }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Subject attendance fetched successfully", attendanceRecords));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch subject attendance", error));
  }
}


// Get subjects for student_id
export async function getStudentSubjects(req: Request, res: Response): Promise<void> {
  try {
    const { student_id } = req.params;

    const studentSubjects = await prismaClient.subject.findMany({
      // where: { student_id: student_id },
      // include: { subject: true }
      where: {
        studentSubjects: {
          some: {
            student_id: student_id
          }
        }
      }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Student subjects fetched successfully", studentSubjects));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch student subjects", error));
  }
}
