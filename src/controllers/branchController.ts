import express, { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';

export async function editBranch(req: Request, res: Response) {
    try {
        const branchId = req.params.branch_id;

        const { name } = req.body;
        if (!name) {
            res.status(400).json(errorJson('Name Parameter is required', null));
            return;
        }

        const updatedBranch = await prismaClient.branch.update({
            where: { id: branchId },
            data: { name: name },
        });

        res.status(200).json(successJson('Branch Updated Successfully', 1));
    } catch (error) {
        res.status(500).json(errorJson('Internal server error', error));
    }
}

export async function deleteBranch(req: Request, res: Response) {
    try {
        const branchId = req.params.branch_id;

        const branch = await prismaClient.branch.delete({
            where: { id: branchId },
        });

        res.status(204).send(successJson("Branch Deleted Succesfully!", 1));
    } catch (error) {
        res.status(500).json(errorJson('Internal server error', error));
    }
}

export async function getBranchById(req: Request, res: Response) {
    try {
        const branchId = req.params.branch_id;

        const branch = await prismaClient.branch.findUnique({
            where: { id: branchId },
        });

        if (!branch) {
            res.status(404).json(errorJson('Branch not found', null));
            return;
        }

        res.status(200).json(successJson("Get branch SuccessFull!", branch));
    } catch (error) {
        res.status(500).json(errorJson('Internal Server Error', error));
    }
}

export async function getAllBranches(req: Request, res: Response) {
    try {
        const branches = await prismaClient.branch.findMany();
        res.status(200).json(successJson("Get Branches SuccessFul", branches));
    } catch (error) {
        res.status(500).json(errorJson('Internal server error', error));
    }
}

export async function createBranch(req: Request, res: Response) {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json(errorJson('Name is required', null));
            return;
        }

        const newBranch = await prismaClient.branch.create({
            data: { name: name },
        });

        res.status(201).json(successJson('Branch Created successfully!', newBranch.id));
    } catch (error) {
        res.status(500).json(errorJson('Internal server error', error));
    }
}