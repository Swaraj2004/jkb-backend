import { hash } from "bcrypt";
import { Request, Response } from "express";
import { prismaClient } from "../utils/database";
import { SALT } from "../utils/consts";
import { User } from "@prisma/client";
import { successJson, errorJson } from "../utils/common_funcs";


// ask Swaraj bhaiya how to handle the roles
export const createUser = async (req: Request, res: Response) => {
  // const role = await prismaClient[ROLE_COLLECTION_NAME].findOne({ _id: bcrypt(createRecord.role_id) }); // Find role by ID
  // const role = await prismaClient.role.findUnique({
  //     where:{
  //         name: req.role_name
  //     }
  // });
  // const roleName = role ? role.name : null; // Get role name

  const user: User = req.body;
  user.password = await hash(user.password, SALT);      // Hash the password

  // const valuesToPass = {
  //     role_name: roleName,
  //     username: createRecord.username,
  //     password: createRecord.password,
  // };

  try {
    const user: User = req.body;
    user.password = await hash(user.password, SALT);      // Hash the password

    const newUser = await prismaClient.user.create({
      data: user
    });
    res.status(201).json(successJson("Record inserted Successfully", newUser.id));
  } catch {
    res.status(500).json(errorJson("Failed to create user", "Unknown Error"));
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
    const { skip = "0", take = "20" } = req.query;

    // Ensure skip and take are numbers
    const skipValue = parseInt(skip as string, 10);
    const takeValue = parseInt(take as string, 10);

    const users = await prismaClient.user.findMany({
      skip: isNaN(skipValue) ? 0 : skipValue,
      take: isNaN(takeValue) ? 20 : takeValue
    });

    res.status(200).json(successJson("Users fetched successfully", users));
  } catch (error) {
    res.status(500).json(errorJson("Failed to fetch users", "Unknown Error"));
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
  } catch {
    res.status(500).json(errorJson("Failed to create user", "Unknown Error"));
  }
};