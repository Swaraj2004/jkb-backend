import { StudentDetail } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { StudentDetailReqBodyModel } from "../models/student_detail_req_body";
import { successJson, errorJson } from "../utils/common_funcs";
import { prismaClient } from "../utils/database";
import { Request, Response } from 'express';
import { STATUS_CODES } from "../utils/consts";

export async function createStudentDetails(req: Request, res: Response): Promise<void> {
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
    await prismaClient.$transaction(async (prisma): Promise<void> => {
      for (const packageId in body.packages) {
        const packageDetails = await prisma.studentPackage.findFirst({
          where: { package_id: packageId },
          include: { package: true }
        });
        if (!packageDetails) {
          throw new Error(`No such package found: ${packageId}`);
        }
        totalAmount = totalAmount.plus(packageDetails.package.package_fees);
      }
    });

    const createRecord = {
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
      // TODO : there will be also packages and subjects array fix when update
      // student_fees initially keep it equal to total_fees
      total_fees: new Decimal(0),
      pending_fees: new Decimal(0),
      jkb_centre: body.jkb_centre || null,
      semester: body.semester || null,
      university_name: body.university_name || null,
      status: body.status || null,
      remark: body.remark || null,
      enrolled: body.enrolled || false,
    };

    if (totalAmount.gt(0)) {
      // createRecord.num_installments = 1;
      createRecord.total_fees = totalAmount;
      createRecord.pending_fees = totalAmount;
    }

    const newStudentDetail: StudentDetail = await prismaClient.studentDetail.create({
      data: createRecord
    });

    body.subjects.forEach(async (subjectId) => {
      await prismaClient.studentSubject.create({
        data: {
          student_id: newStudentDetail.id,
          subject_id: subjectId
        }
      });
    });
    body.packages.forEach(async (packageId) => {
      await prismaClient.studentPackage.create({
        data: {
          student_id: newStudentDetail.id,
          package_id: packageId
        }
      });
    });
    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Record Inserted Successfully", newStudentDetail.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson('Error creating student record', error));
  }
}

export async function editStudentDetails(req: Request, res: Response): Promise<void> {
  const body: StudentDetailReqBodyModel = req.body;
  const studentId = body.student_id;

  try {
    // TODO : there will be also packages and subjects array fix when update
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
    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Record Updated Successfully", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Error updating student record", error));
  }
}

// Delete StudentDetail record
export async function deleteStudentDetails(req: Request, res: Response): Promise<void> {
  const studentId = req.params.student_id;
  try {
    const deletedStudent: StudentDetail = await prismaClient.studentDetail.delete({
      where: { user_id: studentId }
    });
    res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Record Deleted Successfully", deletedStudent.id));
  } catch (error) {
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Error deleting student record", error));
  }
}

// Get all StudentDetail records
export async function getAllStudentDetails(req: Request, res: Response): Promise<void> {
  try {
    const studentDetails: StudentDetail[] = await prismaClient.studentDetail.findMany();
    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Records fetched successfully", studentDetails));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error fetching student records", error));
  }
}

// Get StudentDetail record by student_id
export async function getStudentDetailById(req: Request, res: Response, studentId: string): Promise<void> {
  try {
    const studentDetail = await prismaClient.studentDetail.findUnique({
      where: { user_id: studentId }
    });
    if (!studentDetail) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Student record not found", null));
      return;
    }
    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Record fetched successfully", studentDetail));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Error fetching student record", error));
  }
}
