import { hash } from 'bcrypt';
import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import {
  DEFAULT_QUERRY_LIMIT,
  DEFAULT_QUERRY_OFFSET,
  SALT,
  STATUS_CODES,
  STUDENT_ROLE,
} from '../utils/consts';
import { Roles, User } from '@prisma/client';
import { successJson, errorJson } from '../utils/common_funcs';
import { UserStudentRequestBody } from '../models/userStudentReqBody';
import { getTotalAmout } from './studentDetailsController';
import { Decimal } from '@prisma/client/runtime/library';

interface RequestBody extends User {
  role_id: string;
}

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user: RequestBody = req.body;
    user.password = await hash(user.password, SALT); // Hash the password

    const userRole = await prismaClient.role.findUnique({
      where: { id: user.role_id },
    }); // Find student role_id

    if (!userRole) {
      res
        .status(STATUS_CODES.CREATE_FAILURE)
        .json(errorJson('User role not found', null));
      return; // dont allow to create a new user
    }
    if (userRole.name === 'super_admin') {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Cannot create a new Super Admin', null));
      return;
    }

    const newUser = await prismaClient.user.create({
      data: {
        email: user.email,
        password: user.password,
        full_name: user.full_name,
        location: user.location,
        phone: user.phone,
        userRole: {
          create: {
            role_id: userRole.id,
          },
        },
      },
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Record inserted Successfully', newUser.id));
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Failed to create user', null));
  }
};

export const createStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user: User = req.body;
    user.password = await hash(user.password, SALT); // Hash the password

    const studentRole = await prismaClient.role.findUnique({
      where: { name: STUDENT_ROLE },
    }); // Find student role_id

    if (!studentRole) {
      res
        .status(STATUS_CODES.CREATE_FAILURE)
        .json(errorJson('Student role not found', null));
      return; // dont allow to create a new user
    }

    // Using transaction to ensure both user and role assignment happen together
    const newUser = await prismaClient.user.create({
      data: {
        full_name: user.full_name,
        password: user.password,
        email: user.email,
        location: user.location,
        phone: user.phone,
        userRole: {
          create: {
            role_id: studentRole.id,
          },
        },
      },
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Record inserted Successfully', newUser.id));
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Failed to create user', null));
  }
};

export const createUserAndStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user: UserStudentRequestBody = req.body;
    if (!user.studentDetail) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('studentDetail is required', null));
      return;
    }

    user.password = await hash(user.password, SALT); // Hash the password

    const studentRole = await prismaClient.role.findUnique({
      where: { name: STUDENT_ROLE },
    }); // Find student role_id

    if (!studentRole) {
      res
        .status(STATUS_CODES.CREATE_FAILURE)
        .json(errorJson('Student role not found', null));
      return; // dont allow to create a new user
    }

    const packageIds = Array.isArray(user.studentDetail.packages)
      ? user.studentDetail.packages
      : [];
    const subjectIds = Array.isArray(user.studentDetail.subjects)
      ? user.studentDetail.subjects
      : [];
    const feeYear = user.studentDetail.fee_year ?? new Date().getFullYear();

    // const packageIds = packageYear.map(pkg => pkg.packageId);
    // const subjectIds = subjectYear.map(sub => sub.subjectId);

    const totalAmount = await getTotalAmout(
      packageIds,
      subjectIds,
      prismaClient
    );

    // Using transaction to ensure both user and role assignment happen together
    const newUser = await prismaClient.user.create({
      data: {
        full_name: user.full_name,
        password: user.password,
        email: user.email,
        location: user.location,
        phone: user.phone,
        userRole: {
          create: {
            role_id: studentRole.id,
          },
        },
        studentDetail: {
          create: {
            parent_contact: user.studentDetail.parent_contact ?? undefined,
            branch_id: user.studentDetail.branch_id ?? undefined,
            diploma_score: user.studentDetail.diploma_score ?? undefined,
            xii_score: user.studentDetail.xii_score ?? undefined,
            cet_score: user.studentDetail.cet_score ?? undefined,
            jee_score: user.studentDetail.jee_score ?? undefined,
            college_name: user.studentDetail.college_name ?? undefined,
            referred_by: user.studentDetail.referred_by ?? undefined,
            student_fees: totalAmount,
            total_fees: totalAmount,
            pending_fees: totalAmount,
            university_name: user.studentDetail.university_name ?? undefined,
            jkb_centre: user.studentDetail.jkb_centre ?? undefined,
            semester: user.studentDetail.semester ?? undefined,
            status: user.studentDetail.status ?? undefined,
            remark: user.studentDetail.remark ?? undefined,
            enrolled: user.studentDetail.enrolled ?? undefined,
            studentSubjects: {
              createMany: {
                data: subjectIds.map((subjectId) => ({
                  subject_id: subjectId,
                  year: feeYear,
                })),
              },
            },
            studentPackages: {
              createMany: {
                data: packageIds.map((packageId) => ({
                  package_id: packageId,
                  year: feeYear,
                })),
              },
            },
            fees: {
              create: {
                year: feeYear,
                student_fees: totalAmount,
                total_fees: totalAmount,
              },
            },
          },
        },
      },
    });

    // if (!newUser) {
    //   res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("User creation failed!", null));
    //   return;
    // }

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson('Record inserted Successfully', newUser.id));
  } catch (error) {
    // console.error("create user error:", error);
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Failed to create user', null));
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  id: string
): Promise<void> => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: id },
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
            branch: true,
            fees: {
              select: {
                id: true,
                student_fees: true,
                total_fees: true,
                year: true,
                payments: {
                  orderBy: { created_at: 'asc' },
                  select: {
                    id: true,
                    fee_id: true,
                    receipt_number: true,
                    amount: true,
                    mode: true,
                    status: true,
                    is_gst: true,
                    user_id: true,
                    remark: true,
                    // pending: true,     // IMPORTANT: remove this column if not necessary in the future
                    created_by: true,
                    created_at: true,
                    // subjectPayments: { select: { subject: { select: { name: true, id: true, subject_fees: true } } } },
                    // packagePayments: { select: { package: { select: { package_name: true, id: true, package_fees: true } } } }
                  },
                },
              },
            },
            studentPackages: {
              select: { package: true, year: true },
            },
            studentSubjects: {
              select: { subject: true, year: true },
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
      .json(successJson('Users fetched successfully', user));
  } catch (error) {
    // console.error(error);
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch users', null));
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  year: string
): Promise<void> => {
  try {
    if (!year) {
      const users = await prismaClient.user.findMany({
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
              branch: true,
              studentPackages: {
                select: { package: true },
              },
              studentSubjects: {
                select: { subject: true },
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
        .json(successJson('Users Fetched Successfully!', users));
      return;
    }

    if (isNaN(parseInt(year))) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson(
            'A valid year query parameter is required, e.g., ?year=2025',
            null
          )
        );
      return;
    }
    // Create the beginning and end date for the given year
    const startDate = new Date(`${year}-04-15T00:00:00.000Z`);
    // Use the next year as the upper bound (non-inclusive)
    const endDate = new Date(`${parseInt(year) + 1}-04-15T00:00:00.000Z`);

    // const { skip = DEFAULT_QUERRY_SKIP, take = DEFAULT_QUERRY_TAKE } = req.query;

    // Ensure skip and take are numbers
    // const skipValue = parseInt(skip as string, 10);
    // const takeValue = parseInt(take as string, 10);

    const users = await prismaClient.user.findMany({
      // skip: isNaN(skipValue) ? 0 : skipValue,
      // take: isNaN(takeValue) ? 20 : takeValue,
      where: {
        created_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      // packages, subject, branch
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
            branch: true,
            fees: {
              orderBy: { year: 'desc' },
              take: 1,
            },
            studentPackages: {
              select: { package: true },
            },
            studentSubjects: {
              select: { subject: true },
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
      .json(successJson('Users fetched successfully', users));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to fetch users', null));
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.user_id;
  try {
    const user = await prismaClient.user.delete({
      where: { id: userId },
    });

    res
      .status(STATUS_CODES.DELETE_SUCCESS)
      .json(successJson('Record deleted Successfully', 1));
  } catch (error) {
    // console.error(error);
    // NOTE: handle error when id does not exist
    res
      .status(STATUS_CODES.DELETE_FAILURE)
      .json(errorJson('Failed to delete user', null));
  }
};

// for now its a hard update that is all the fields will be updated even if 1 field is updated in reality
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user: User = req.body;
    if (!user.id && !user.email) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson('User identifier missing', 'Provide either ID or Email')
        );
      return;
    }

    if (user.password) {
      user.password = await hash(user.password, SALT); // Hash the password
    }

    // Exclude fields that should not be updated
    const { id, created_at, updated_at, ...updateData } = user;

    await prismaClient.user.update({
      where: user.id ? { id: user.id } : { email: user.email },
      data: updateData,
    });
    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Record Updated Successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Failed to update user', null));
  }
};
