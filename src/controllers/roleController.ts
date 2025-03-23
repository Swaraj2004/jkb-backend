import { Request, Response } from 'express';
import { prismaClient } from '../utils/database';
import { errorJson, successJson } from '../utils/common_funcs';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function getRolesById(req: Request, res: Response, roleId: string) {
    try {
        const role = await prismaClient.role.findUnique({ where: { id: roleId } });

        if (!role) {
            res.status(404).json(errorJson("Role not found", null));
            return;
        }

        res.json(successJson("Role fetched successfully", role));
    } catch (error) {
        res.status(500).json(errorJson("Server error", error));
    }
}

export async function getAllRoles(req: Request, res: Response) {
    try {
        const roles = await prismaClient.role.findMany();
        res.json(successJson("Roles fetched successfully", roles));
    } catch (error) {
        res.status(500).json(errorJson("Server error", error));
    }
}

export async function createRole(req: Request, res: Response) {
    try {
        const { name } = req.body;
        const newRole = await prismaClient.role.create({ data: { name } });

        res.status(201).json(successJson("Role created successfully", newRole.id));
    } catch (error) {
        res.status(500).json(errorJson("Server error", error));
    }
}

export async function deleteRole(req: Request, res: Response, roleId:string) {
    try {
        const role = await prismaClient.role.findUnique({ where: { id: roleId } });

        if (!role) {
            res.status(404).json(errorJson("Role not found", null));
            return;
        }

        if (role.name === 'super_admin') {
            res.status(400).json(errorJson("Super admin cannot be deleted!", null));
            return;
        }

        await prismaClient.role.delete({ where: { id: roleId } });

        res.status(204).send(successJson("Role Deleted Successfully!", 1));
    } catch (error) {
        res.status(500).json(errorJson("Server error", error));
    }
}

export async function updateRole(req: Request, res: Response) {
    try {
        const { id, name } = req.body;

        await prismaClient.role.update({
            where: { id },
            data: { name },
        });

        res.status(202).json(successJson("Role updated successfully", 1));
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === "P2025") {
            res.status(404).json(errorJson("Role not found", error.message));
        } else {
            res.status(500).json(errorJson("Server Error", error));
        }
    }
}