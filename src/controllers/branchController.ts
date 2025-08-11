import express, { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { STATUS_CODES } from '../utils/consts';

export async function editBranch(req: Request, res: Response): Promise<void> {
  try {
    const branchId = req.params.branch_id;

    const { name } = req.body;
    if (!name) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Name Parameter is required', null));
      return;
    }

    const updatedBranch = await prismaClient.branch.update({
      where: { id: branchId },
      data: { name: name },
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson('Branch Updated Successfully', 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson('Internal server error', null));
  }
}

export async function deleteBranch(req: Request, res: Response): Promise<void> {
  try {
    const branchId = req.params.branch_id;

    const branch = await prismaClient.branch.delete({
      where: { id: branchId },
    });

    res.status(STATUS_CODES.DELETE_SUCCESS).send(successJson("Branch Deleted Succesfully!", 1));
  } catch (error) {
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson('Internal server error', null));
  }
}

export async function getBranchById(req: Request, res: Response): Promise<void> {
  try {
    const branchId = req.params.branch_id;

    const branch = await prismaClient.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true }
    });

    if (!branch) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Branch not found', null));
      return;
    }

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Get branch SuccessFull!", branch));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Internal Server Error', null));
  }
}

export async function getAllBranchesIdName(req: Request, res: Response): Promise<void> {
  try {
    const branches = await prismaClient.branch.findMany({
      select: { id: true, name: true }
    });
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Get Branches SuccessFul", branches));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson('Internal server error', null));
  }
}

export async function createBranch(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;

    if (!name) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Name is required', null));
      return;
    }

    const newBranch = await prismaClient.branch.create({
      data: { name: name },
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson('Branch Created successfully!', newBranch.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson('Internal server error', null));
  }
}
