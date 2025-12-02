import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { STATUS_CODES } from '../utils/consts';
import {
  StudentSubjectPackageBody,
  SubjectRequestBody,
} from '../models/subject_req_body';
import { Decimal } from '@prisma/client/runtime/library';
import { getTotalAmout } from './studentDetailsController';

// Get all subjects
export async function getSubjects(req: Request, res: Response): Promise<void> {
  try {
    const subjects = await prismaClient.subject.findMany({
      include: {
        subjectProfessors: {
          select: {
            professor: {
              select: { id: true, full_name: true },
            },
          },
        },
      },
    });
    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Subjects fetched successfully', subjects));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch subjects', null));
  }
}

// Get subject by ID
export async function getSubjectById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { subject_id } = req.params;

    const subject = await prismaClient.subject.findUnique({
      where: { id: subject_id },
      include: {
        subjectProfessors: {
          select: {
            professor: {
              select: { id: true, full_name: true },
            },
          },
        },
      },
    });

    if (!subject) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Subject not found', null));
      return;
    }

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Subject fetched successfully', subject));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch subject', null));
  }
}

export async function createStudentSubjectStudentPackages(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reqBody: StudentSubjectPackageBody[] = req.body;

    if (!Array.isArray(reqBody) || reqBody.length === 0) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Request body must be a non-empty array', null));
      return;
    }

    for (const item of reqBody) {
      const { student_id, year, package_ids, subject_ids } = item;

      const studentDetail = await prismaClient.studentDetail.findUnique({
        where: { id: student_id },
        select: {
          id: true,
          fees: {
            where: { year },
            select: {
              id: true,
              student_fees: true,
              total_fees: true,
              payments: { select: { amount: true } },
            },
          },
        },
      });

      if (!studentDetail) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json(
            errorJson(
              'Student Detail with given student_id does not exist!',
              null
            )
          );
        return;
      }

      // if studentDetail has a payment related to it then do not update the subjects or packages
      // TODO: ask sir about what to do
      if (studentDetail.fees?.[0]?.payments?.length > 0) {
        res
          .status(STATUS_CODES.UPDATE_FAILURE)
          .json(
            errorJson('Student has a payment related to it in this year.', null)
          );
        return;
      }

      // 3) Calculate total fees for these packageIds + subjectIds
      const totalAmount = await getTotalAmout(
        package_ids ?? [],
        subject_ids ?? [],
        prismaClient
      );

      const feeRecord = studentDetail.fees?.[0];
      // NOTE:
      // the below code is to check the student fees with totalFees
      // but now we dont let this happen if student has a payment related
      //
      // if (feeRecord && totalAmount.lessThan(feeRecord.student_fees)) {
      //   res
      //     .status(STATUS_CODES.CREATE_FAILURE)
      //     .json(
      //       errorJson('totalAmount cannot be less than student_fees', null)
      //     );
      //   return;
      // }

      // 1) Delete existing studentPackage/studentSubject rows for this student+year (scope by year)
      // OPTIMIZE: see if prisma allows transaction with superbase to maintain atomicity
      await prismaClient.studentPackage.deleteMany({
        where: { student_id, year },
      });
      await prismaClient.studentSubject.deleteMany({
        where: { student_id, year },
      });

      // 2) Create new package & subject rows
      if (Array.isArray(package_ids) && package_ids.length > 0) {
        await prismaClient.studentPackage.createMany({
          data: package_ids.map((pkgId) => ({
            student_id,
            package_id: pkgId,
            year,
          })),
        });
      }

      if (Array.isArray(subject_ids) && subject_ids.length > 0) {
        await prismaClient.studentSubject.createMany({
          data: subject_ids.map((subjectId) => ({
            student_id,
            subject_id: subjectId,
            year,
          })),
        });
      }

      await prismaClient.studentDetail.update({
        where: { id: studentDetail.id },
        data: {
          total_fees: totalAmount,
          student_fees: 0, // IMPORTANT: make student fees 0 on updating subjects and packages
          fees: {
            upsert: {
              // NOTE: create if absent, update if present
              where: {
                year_student_id: {
                  year,
                  student_id,
                },
              },
              update: {
                total_fees: totalAmount,
                student_fees: 0, // here also
              },
              create: {
                student_fees: totalAmount,
                total_fees: totalAmount,
                year,
              },
            },
          },
        },
      });
    }

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Student Subject & Packages created successfully!', 1));
  } catch (error) {
    // console.error(error);
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Failed to create Student Subject & Packages', null));
  }
}

// Create a new subject
export async function createSubject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reqBody: SubjectRequestBody = req.body; // professor_id

    if (!reqBody.name || !reqBody.subject_fees) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Name and Subject Fees are required', null));
      return;
    }

    const subjectId = await prismaClient.$transaction(
      async (tx): Promise<string> => {
        const subject = await tx.subject.create({
          data: {
            name: reqBody.name,
            subject_fees: reqBody.subject_fees,
          },
        });

        // for now there are no checks here but in future there can be bugs like there is an entry in subject but not in SubjectProfessor
        const data = reqBody.professor_user_ids.map(
          (professorUserId: string) => ({
            professor_id: professorUserId,
            subject_id: subject.id,
          })
        );

        await tx.subjectProfessor.createMany({
          data: data,
        });

        return subject.id;
      }
    );

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Subject created successfully', subjectId));
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Failed to create subject', null));
  }
}

// Update a subject
export async function updateSubject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id, ...rest } = req.body;
    const subjectReqBody: SubjectRequestBody = rest;
    // console.log(subjectReqBody, '\t', id);

    if (!id || !subjectReqBody.name || !subjectReqBody.subject_fees) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('ID, Name, and Subject Fees are required', null));
      return;
    }

    const updatedSubject = await prismaClient.subject.update({
      where: { id },
      data: {
        name: subjectReqBody.name,
        subject_fees: subjectReqBody.subject_fees,
      },
    });

    if (!updatedSubject) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(successJson('Subject Not Found', null));
      return;
    }

    // OPTIMIZE: improve the logic for now its hard coded
    await prismaClient.subjectProfessor.deleteMany({
      where: { subject_id: updatedSubject.id },
    });

    const data = subjectReqBody.professor_user_ids.map(
      (professorUserId: string) => ({
        professor_id: professorUserId,
        subject_id: updatedSubject.id,
      })
    );

    await prismaClient.subjectProfessor.createMany({
      data: data,
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Subject updated successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Failed to update subject', null));
  }
}

export async function deleteSubject(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { subject_id } = req.params;

    await prismaClient.subject.delete({ where: { id: subject_id } });

    res
      .status(STATUS_CODES.DELETE_SUCCESS)
      .json(successJson('Subject deleted successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.DELETE_FAILURE)
      .json(errorJson('Failed to delete subject', null));
  }
}

// Get users enrolled in subjects
export async function getSubjectUsers(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { subject_id, year } = req.query;
    if (!subject_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Subject Id is absent', null));
      return;
    }
    if (!year) {
      const subjectUsers = await prismaClient.user.findMany({
        where: {
          studentDetail: {
            is: {
              OR: [
                // either enrolled in the subject or the pacakge containing that subject
                {
                  studentSubjects: {
                    some: { subject_id: subject_id as string },
                  },
                },
                {
                  studentPackages: {
                    some: {
                      package: {
                        packageSubjects: {
                          some: { subject_id: subject_id as string },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
        select: {
          email: true,
          full_name: true,
          phone: true,
          location: true,
          id: true,
          lastlogin: true,
          created_at: true,
          studentDetail: {
            include: {
              studentPackages: true,
              studentSubjects: true,
              fees: {
                orderBy: { year: 'desc' },
                take: 1,
              },
            },
          },
          userRole: {
            select: { role: { select: { id: true, name: true } } },
          },
        },
      });

      res
        .status(STATUS_CODES.SELECT_SUCCESS)
        .json(successJson('Subject users fetched successfully', subjectUsers));
      return;
    }

    const numericYear = parseInt(year as string, 10);
    if (isNaN(numericYear)) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('year must be a valid number', null));
      return;
    }
    const subjectUsers = await prismaClient.user.findMany({
      where: {
        studentDetail: {
          // studentSubjects: {
          // some: {
          //   subject_id: subject_id as string,
          //   year: numericYear,
          //   // created_at: {
          //   //   gte: new Date(`${numericYear}-04-15T00:00:00.000Z`), // Start of the given year
          //   //   lt: new Date(`${numericYear + 1}-04-15T00:00:00.000Z`), // Start of the next year
          //   // },
          // },
          // },
          is: {
            OR: [
              // either enrolled in the subject or the pacakge containing that subject
              {
                studentSubjects: {
                  some: { subject_id: subject_id as string, year: numericYear },
                },
              },
              {
                studentPackages: {
                  some: {
                    year: numericYear,
                    package: {
                      packageSubjects: {
                        some: { subject_id: subject_id as string },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
      select: {
        email: true,
        full_name: true,
        phone: true,
        location: true,
        id: true,
        lastlogin: true,
        created_at: true,
        studentDetail: {
          include: {
            fees: {
              orderBy: { year: 'desc' },
              take: 1,
            },
            studentPackages: true,
            studentSubjects: true,
          },
        },
        userRole: {
          select: { role: { select: { id: true, name: true } } },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Subject users fetched successfully', subjectUsers));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch subject users', null));
  }
}

export async function getSubjectAttendance(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { subject_id } = req.query;
    if (!subject_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Subject Id absent', null));
      return;
    }
    const attendanceRecords = await prismaClient.attendance.findMany({
      where: {
        lecture: { subject_id: subject_id as string },
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

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(
        successJson(
          'Subject attendance fetched successfully',
          attendanceRecords
        )
      );
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch subject attendance', null));
  }
}

// Get subjects for student_id
export async function getStudentSubjects(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { student_id } = req.params;

    const studentSubjects = await prismaClient.subject.findMany({
      // where: { student_id: student_id },
      // include: { subject: true }
      where: {
        studentSubjects: {
          some: {
            student_id: student_id,
          },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(
        successJson('Student subjects fetched successfully', studentSubjects)
      );
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch student subjects', null));
  }
}
