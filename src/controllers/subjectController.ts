import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { STATUS_CODES } from '../utils/consts';

// Get all subjects
export async function getSubjects(req: Request, res: Response) {
    try {
        const subjects = await prismaClient.subject.findMany();
        res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Subjects fetched successfully", subjects));
    } catch (error) {
        res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Failed to fetch subjects", error));
    }
}


// Get subject by ID
export async function getSubjectById(req: Request, res: Response) {
    try {
        const { subject_id } = req.params;

        const subject = await prismaClient.subject.findUnique({
            where: { id: subject_id }
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
export async function createSubject(req: Request, res: Response) {
    try {
        const { name, subject_fees } = req.body;

        if (!name || !subject_fees) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Name and Subject Fees are required", null));
            return;
        }

        const subject = await prismaClient.subject.create({
            data: { name, subject_fees }
        });

        res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Subject created successfully", subject.id));
    } catch (error) {
        res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Failed to create subject", error));
    }
}

// Update a subject
export async function updateSubject(req: Request, res: Response) {
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

export async function deleteSubject(req: Request, res: Response) {
    try {
        const { subject_id } = req.params;

        await prismaClient.subject.delete({ where: { id: subject_id } });

        res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Subject deleted successfully", 1));
    } catch (error) {
        res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Failed to delete subject", error));
    }
}

// Get users enrolled in subjects
export async function getSubjectUsers(req: Request, res: Response) {
    try {
        const { subject_id, year } = req.query;
        if (!subject_id || !year) {
            res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('Subject Id or year absent', null));
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


export async function getSubjectAttendance(req: Request, res: Response) {
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
export async function getStudentSubjects(req: Request, res: Response) {
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