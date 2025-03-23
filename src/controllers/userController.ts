import { hash } from "bcrypt";
import { Request, Response } from "express";
import { prismaClient } from "../utils/database";
import { DEFAULT_QUERRY_SKIP, DEFAULT_QUERRY_TAKE, SALT, STUDENT_ROLE } from "../utils/consts";
import { User } from "@prisma/client";
import { successJson, errorJson } from "../utils/common_funcs";

export const createUser = async (req: Request, res: Response) => {
  // user, usertoken and user roles
  // const valuesToPass = {
  //     role_name: roleName,
  //     username: createRecord.username,
  //     password: createRecord.password,
  // };

  try {
    const user: User = req.body;
    user.password = await hash(user.password, SALT);      // Hash the password

    const studentRole = await prismaClient.role.findUnique({
      where: { name: STUDENT_ROLE }
    }); // Find student role_id

    if (!studentRole) {
      res.status(500).json(errorJson("Student role not found", null));
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

    res.status(201).json(successJson("Record inserted Successfully", newUser.id));
  } catch (error) {
    res.status(500).json(errorJson("Failed to create user", error instanceof Error ? error.message : "Unknown Error"));
  }
};

export const getUsers = async (req: Request, res: Response, id: string | null = null) => {
  try {
    if (id) {
      const user = await prismaClient.user.findUnique({
        where: {
          id: id
        }
      });
      res.status(200).json(successJson("Users fetched successfully", user));
      return;
    }
    const { skip = DEFAULT_QUERRY_SKIP, take = DEFAULT_QUERRY_TAKE } = req.query;

    // Ensure skip and take are numbers
    const skipValue = parseInt(skip as string, 10);
    const takeValue = parseInt(take as string, 10);

    const users = await prismaClient.user.findMany({
      skip: isNaN(skipValue) ? 0 : skipValue,
      take: isNaN(takeValue) ? 20 : takeValue
    });

    res.status(200).json(successJson("Users fetched successfully", users));
  } catch (error) {
    res.status(500).json(errorJson("Failed to fetch users", error instanceof Error ? error.message : "Unknown Error"));
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
    res.status(201).json(successJson("Record deleted Successfully", 1));
  } catch (error) {
    res.status(500).json(errorJson("Failed to create user", error instanceof Error ? error.message : "Unknown Error"));
  }
};

// for now its a hard update that is all the fields will be updated even if 1 field is updated in reality
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    if (!user.id && !user.email) {
      res.status(400).json(errorJson("User identifier missing", "Provide either ID or Email"));
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
    res.status(201).json(successJson("Record Updated Successfully", 1));
  } catch (error) {
    res.status(500).json(errorJson("Failed to update user", error instanceof Error ? error.message : "Unknown Error"));
  }
}