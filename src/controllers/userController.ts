import { hash } from "bcrypt";
import { Request, Response } from "express";
import { prismaClient } from "../utils/database";
import { DEFAULT_QUERRY_SKIP, DEFAULT_QUERRY_TAKE, SALT, STATUS_CODES, STUDENT_ROLE } from "../utils/consts";
import { Roles, User } from "@prisma/client";
import { successJson, errorJson } from "../utils/common_funcs";

interface RequestBody extends User {
  role_name: Roles
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const user: RequestBody = req.body;
    if (user.role_name === 'super_admin') {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Cannot create a new Super Admin", null));
      return;
    }
    user.password = await hash(user.password, SALT);      // Hash the password

    const userRole = await prismaClient.role.findUnique({
      where: { name: user.role_name }
    }); // Find student role_id

    if (!userRole) {
      res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("User role not found", null));
      return;     // dont allow to create a new user
    }

    // Using transaction to ensure both user and role assignment happen together
    const newUser = await prismaClient.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          email: user.email,
          password: user.password,
          full_name: user.full_name,
          location: user.location,
          phone: user.phone,
        }
      });

      await prisma.userRole.create({
        data: {
          role_id: userRole.id,
          user_id: createdUser.id
        }
      });

      return createdUser;
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Record inserted Successfully", newUser.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Failed to create user", error instanceof Error ? error.message : "Unknown Error"));
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    user.password = await hash(user.password, SALT);      // Hash the password

    const studentRole = await prismaClient.role.findUnique({
      where: { name: STUDENT_ROLE }
    }); // Find student role_id

    if (!studentRole) {
      res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Student role not found", null));
      return;     // dont allow to create a new user
    }

    // Using transaction to ensure both user and role assignment happen together
    const newUser = await prismaClient.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: user
      });

      await prisma.userRole.create({
        data: {
          role_id: studentRole.id,
          user_id: createdUser.id
        }
      });

      return createdUser;
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Record inserted Successfully", newUser.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Failed to create user", error instanceof Error ? error.message : "Unknown Error"));
  }
};

export const getUserById = async (req: Request, res: Response, id: string) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: { id: id },
      select: {
        email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true,
        studentDetail: {
          include: {
            branch: true,
            studentPackages: {
              select: { package: true }
            },
            studentSubjects: {
              select: { subject: true }
            }
          }
        },
      }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Users fetched successfully", user));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch users", error instanceof Error ? error.message : "Unknown Error"));
  }
};

export const getUsers = async (req: Request, res: Response, year: string) => {
  try {
    if (!year || typeof year !== 'string' || isNaN(parseInt(year))) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("A valid year query parameter is required, e.g., ?year=2025", null));
      return;
    }

    // Create the beginning and end date for the given year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    // Use the next year as the upper bound (non-inclusive)
    const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);

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
          lt: endDate
        }
      },
      // packages, subject, branch
      select: {
        email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true,
        studentDetail: {
          include: {
            branch: true,
            studentPackages: {
              select: { package: true }
            },
            studentSubjects: {
              select: { subject: true }
            }
          }
        },
      }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Users fetched successfully", users));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch users", error instanceof Error ? error.message : "Unknown Error"));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.user_id;
  try {
    const deletedUser = await prismaClient.user.delete({
      where: {
        id: userId
      }
    });
    res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Record deleted Successfully", 1));
  } catch (error) {
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Failed to create user", error instanceof Error ? error.message : "Unknown Error"));
  }
};

// for now its a hard update that is all the fields will be updated even if 1 field is updated in reality
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    if (!user.id && !user.email) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("User identifier missing", "Provide either ID or Email"));
      return;
    }

    if (user.password) {
      user.password = await hash(user.password, SALT);      // Hash the password
    }

    // Exclude fields that should not be updated
    const { id, created_at, updated_at, ...updateData } = user;

    await prismaClient.user.update({
      where: user.id ? { id: user.id } : { email: user.email },
      data: updateData
    })
    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Record Updated Successfully", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Failed to update user", error instanceof Error ? error.message : "Unknown Error"));
  }
}