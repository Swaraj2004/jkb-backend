import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { PROFESSOR_ROLE, STATUS_CODES } from '../utils/consts';

export async function updateCoursePackage(req: Request, res: Response) {
  try {
    const updatedRecord = req.body;
    if (!updatedRecord.id) {
      res.status(STATUS_CODES.UPDATE_SUCCESS).json(errorJson('Course package id is required', null));
      return;
    }
    const updatedCoursePackage = await prismaClient.package.update({
      where: { id: updatedRecord.id },
      data: updatedRecord,
    });
    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson('CoursePackage Updated Successfully!', updatedCoursePackage.id));
  } catch (error: any) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson('Server Error', error));
  }
}

export async function deleteCoursePackage(req: Request, res: Response, course_package_id: string) {
  try {
    await prismaClient.package.delete({
      where: { id: course_package_id },
    });
    res.status(STATUS_CODES.DELETE_SUCCESS).send(successJson('CoursePackage deleted Successfully!', 1));
  } catch (error: any) {
    res.status(STATUS_CODES.DELETE_FAILURE).json({ error: error.message });
  }
}

export async function createCoursePackage(req: Request, res: Response) {
  try {
    const createRecord = req.body;
    const newCoursePackage = await prismaClient.package.create({
      data: createRecord,
    });
    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson('CoursePackage created successfully!', newCoursePackage.id));
  } catch (error: any) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson('Server Error', error));
  }
}

export async function getStudentPackages(req: Request, res: Response, student_id: string) {
  try {
    // const { student_id } = req.params;
    const student = await prismaClient.studentDetail.findUnique({
      where: { user_id: student_id },
      include: {
        studentPackages: {
          include: {
            package: true
          }
        }
      }
    });

    if (!student) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Student not found!', null));
      return;
    }

    // Filter out any nulls (if a package wasn't found).
    const validPackages = student.studentPackages.map((studentPackage) => studentPackage.package).filter(pkg => pkg !== null);

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson('Record fetched successfully', validPackages));
  } catch (error: any) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Server Error', null));
  }
}

export async function getSubjectPackageUsers(req: Request, res: Response) {
  try {
    const { subject_package_id, year } = req.query;
    if (!subject_package_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('subject_package_id is required', null));
      return;
    }

    // Build filter for StudentDetail.
    let filter: any = {
      packages: {
        has: subject_package_id, // Assuming 'packages' is a string[] field.
      },
    };

    if (year) {
      const y = parseInt(year as string);
      if (isNaN(y)) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Invalid year', null));
        return;
      }
      // Filter by createdAt between the start and end of the year.
      const startDate = new Date(y, 0, 1);
      const endDate = new Date(y, 11, 31, 23, 59, 59, 999);
      filter.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    console.log(filter);
    const studentDetails = await prismaClient.studentDetail.findMany({
      where: filter,
      // include: { user: { select: { password: false, email: true, ... } } }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson('Record fetched successfully', studentDetails));
  } catch (error: any) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Server Error', error));
  }
}

export async function getAllCoursePackages(req: Request, res: Response) {
  try {
    const coursePackages = await prismaClient.package.findMany({
      include: {
        packageSubjects: {
          select: {
            subject: true
          }
        }
      }
    });
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson('Course Packages Fetched Successfully!', coursePackages));
  } catch (error: any) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Server error', error));
  }
}
export async function getAllCoursePackagesIdName(req: Request, res: Response) {
  try {
    const coursePackages = await prismaClient.package.findMany({
      select: { id: true, package_name: true },
    });
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson('Course Packages Fetched Successfully!', coursePackages));
  } catch (error: any) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Server error', error));
  }
}

export async function getCoursePackageById(req: Request, res: Response, course_package_id: string) {
  try {
    const coursePackage = await prismaClient.package.findUnique({
      where: { id: course_package_id },
    });

    if (!coursePackage) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Course package not found', null));
      return;
    }
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson('Course Package Fetched Successfully!', coursePackage));
  } catch (error: any) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Server error', error));
  }
}

export async function getProfessors(req: Request, res: Response) {
  try {
    const professors = await prismaClient.user.findMany({
      where: {
        userRole: {
          some: {
            role: {
              name: PROFESSOR_ROLE
            }
          }
        }
      },
      select: { email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true }
    });


    if (!professors) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Course package not found', null));
      return;
    }
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson('Course Package Fetched Successfully!', professors));
  } catch (error: any) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Server error', error));
  }
}
