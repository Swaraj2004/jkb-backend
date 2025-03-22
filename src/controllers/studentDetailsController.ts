import { StudentDetail } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { StudentDetailReqBodyModel } from "../models/student_detail_req_body";
import { successJson, errorJson } from "../utils/common_funcs";
import { prismaClient } from "../utils/database";
import express, { Request, Response } from 'express';

export async function createStudentDetails(req: Request, res: Response) {
    const body: StudentDetailReqBodyModel = req.body;
    let totalAmount = new Decimal(0);
    // if do if subject fees is there
    // // Calculate total fees based on subjects
    // if (createRecord.subjects && Array.isArray(createRecord.subjects)) {
    //     for (const subjectId of createRecord.subjects) {
    //         const subjectDoc = await dbInstance[SUBJECT_COLLECTION_NAME].findOne({ _id: convertToBsonId(subjectId) });
    //         if (subjectDoc && subjectDoc.subject_fees) {
    //             totalAmount += subjectDoc.subject_fees;
    //         }
    //     }
    // }

    try {
        await prismaClient.$transaction(async (prisma) => {
            for (const packageId in body.packages) {
                const packageDetails = await prisma.studentCoursePackage.findFirst({
                    where: { package_id: packageId },
                    include: { coursePackage: true }
                });
                if (!packageDetails) {
                    throw new Error(`No such package found: ${packageId}`);
                }
                totalAmount = totalAmount.plus(packageDetails.coursePackage.package_fees);
            }
        });

        const createRecord: StudentDetail = {
            id: crypto.randomUUID(),
            user_id: body.student_id, // Assign from request body
            created_at: new Date(),
            updated_at: new Date(),
            parent_contact: body.parent_contact || null,
            branch_id: body.branch_id || null,
            diploma_score: body.diploma_score || null,
            xii_score: body.xii_score || null,
            cet_score: body.cet_score || null,
            jee_score: body.jee_score || null,
            college_name: body.college_name || null,
            referred_by: body.referred_by || null,
            total_fees: new Decimal(0),
            pending_fees: new Decimal(0),
            university_name: body.university_name || null,
            status: body.status || null,
            remark: body.remark || null,
            enrolled: false,
        };

        if (totalAmount.gt(0)) {
            // createRecord.num_installments = 1;
            createRecord.total_fees = totalAmount;
            createRecord.pending_fees = totalAmount;
        }

        const newStudentDetail: StudentDetail = await prismaClient.studentDetail.create({
            data: createRecord
        });
        res.status(201).json(successJson("Record Inserted Successfully", newStudentDetail.id));
    } catch (error) {
        res.status(500).json(errorJson('Error creating student record', error));
    }
}

export async function editStudentDetails(req: Request, res: Response) {
    const body: StudentDetailReqBodyModel = req.body;
    const studentId = body.student_id;

    try {
        const updatedStudent: StudentDetail = await prismaClient.studentDetail.update({
            where: { user_id: studentId },
            data: {
                parent_contact: body.parent_contact || null,
                branch_id: body.branch_id || null,
                diploma_score: body.diploma_score || null,
                xii_score: body.xii_score || null,
                cet_score: body.cet_score || null,
                jee_score: body.jee_score || null,
                college_name: body.college_name || null,
                referred_by: body.referred_by || null,
                total_fees: body.total_fees ? new Decimal(body.total_fees) : undefined,
                pending_fees: body.pending_fees ? new Decimal(body.pending_fees) : undefined,
                university_name: body.university_name || null,
                status: body.status || null,
                remark: body.remark || null,
                enrolled: body.enrolled ?? undefined, // Keep existing if not provided
            },
        });
        res.status(200).json(successJson("Record Updated Successfully", updatedStudent));
    } catch (error) {
        res.status(500).json(errorJson("Error updating student record", error));
    }
}

// Delete StudentDetail record
export async function deleteStudentDetails(req: Request, res: Response) {
    const studentId = req.params.student_id;
    try {
        const deletedStudent: StudentDetail = await prismaClient.studentDetail.delete({
            where: { user_id: studentId }
        });
        res.status(200).json(successJson("Record Deleted Successfully", deletedStudent.id));
    } catch (error) {
        res.status(500).json(errorJson("Error deleting student record", error));
    }
}

// Get all StudentDetail records
export async function getAllStudentDetails(req: Request, res: Response) {
    try {
        const studentDetails: StudentDetail[] = await prismaClient.studentDetail.findMany();
        res.status(200).json(successJson("Records fetched successfully", studentDetails));
    } catch (error) {
        res.status(500).json(errorJson("Error fetching student records", error));
    }
}

// Get StudentDetail record by student_id
export async function getStudentDetailById(req: Request, res: Response) {
    const studentId = req.params.student_id;
    try {
        const studentDetail = await prismaClient.studentDetail.findUnique({
            where: { user_id: studentId }
        });
        if (!studentDetail) {
            res.status(404).json(errorJson("Student record not found", null));
            return;
        }
        res.status(200).json(successJson("Record fetched successfully", studentDetail));
    } catch (error) {
        res.status(500).json(errorJson("Error fetching student record", error));
    }
}