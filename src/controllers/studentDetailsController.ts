import { PrismaClient, StudentDetail } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { StudentDetailReqBodyModel } from "../models/student_detail_req_body";
import { successJson, errorJson } from "../utils/common_funcs";
import { prismaClient } from "../utils/database";
import { Request, Response } from 'express';
import { STATUS_CODES, STUDENT_ROLE } from "../utils/consts";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

async function getTotalAmout(packageIds: string[], subjectIds: string[], prisma: PrismaClient): Promise<Decimal> {
  let totalAmount = new Decimal(0);
  if (packageIds.length > 0) {
    const packages = await prisma.package.findMany({
      where: {
        id: {
          in: packageIds
        }
      },
      select: {
        package_fees: true
      }
    });

    packages.forEach(pkg => {
      totalAmount = totalAmount.plus(pkg.package_fees);
    });
  }

  if (subjectIds.length > 0) {
    const subjects = await prisma.subject.findMany({
      where: {
        id: {
          in: subjectIds
        },
      },
      select: {
        subject_fees: true
      },
    });

    subjects.forEach(subject => {
      totalAmount = totalAmount.plus(subject.subject_fees);
    });
  }
  return totalAmount;
}

export async function createStudentDetails(req: Request, res: Response): Promise<void> {
  const body: StudentDetailReqBodyModel = req.body;

  try {
    const packageIds = Array.isArray(body.packages) ? body.packages : [];
    const subjectIds = Array.isArray(body.subjects) ? body.subjects : [];

    let totalAmount = await getTotalAmout(packageIds, subjectIds, prismaClient);
    // console.log(totalAmount);

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
      student_fees: new Decimal(totalAmount),
      total_fees: new Decimal(totalAmount),
      pending_fees: new Decimal(totalAmount),
      jkb_centre: body.jkb_centre || null,
      semester: body.semester || null,
      university_name: body.university_name || null,
      status: body.status || null,
      remark: body.remark || null,
      enrolled: body.enrolled || false,
    };

    const newStudentDetail: StudentDetail = await prismaClient.studentDetail.create({
      data: createRecord
    });

    if (subjectIds.length > 0) {
      const subjectData = subjectIds.map((subjectId: string) => ({
        student_id: newStudentDetail.id,
        subject_id: subjectId,
      }));

      await prismaClient.studentSubject.createMany({
        data: subjectData,
      });
    }

    if (packageIds.length > 0) {
      const packageData = packageIds.map((packageId: string) => ({
        student_id: newStudentDetail.id,
        package_id: packageId,
      }));

      await prismaClient.studentPackage.createMany({
        data: packageData,
      });
    }

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Record Inserted Successfully", newStudentDetail.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson('Error creating student record', error));
  }
}

export async function editStudentDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const body: StudentDetailReqBodyModel = req.body;
  const studentId = body.student_id;
  const student_fees = body.student_fees || 0;
  // remove power for student to edit student_fees, WARN: there can be a potential security threat to tamper jwt token
  if (req.user!.role_name === STUDENT_ROLE && student_fees > 0) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Student can't edit student_fees!", null));
    return;
  }

  try {
    const packageIds = Array.isArray(body.packages) ? body.packages : [];
    const subjectIds = Array.isArray(body.subjects) ? body.subjects : [];

    if (student_fees > 0) {           // student_fees cant be edited if there is even a single payment record in the Payment Table
      const paymentCount = await prismaClient.payment.count({
        where: { user_id: studentId }
      });
      if (paymentCount > 0) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("student_fees can't be edited payment aldready exist of the given student_id", null));
        return;
      }
    }

    const totalAmount = await getTotalAmout(packageIds, subjectIds, prismaClient);
    const pending_fees = student_fees > 0 ? student_fees : body.pending_fees;       // NOTE: this logic is only applicable if there is no payment Record in table

    await prismaClient.$transaction(async (prisma): Promise<void> => {
      const updatedStudent: StudentDetail = await prisma.studentDetail.update({
        where: { user_id: studentId },
        data: {
          parent_contact: body.parent_contact || undefined,
          branch_id: body.branch_id || undefined,
          diploma_score: body.diploma_score || undefined,
          xii_score: body.xii_score || undefined,
          cet_score: body.cet_score || undefined,
          jee_score: body.jee_score || undefined,
          college_name: body.college_name || undefined,
          referred_by: body.referred_by || undefined,
          student_fees: new Decimal(student_fees),
          total_fees: new Decimal(totalAmount),                                              // totalAmount is being assigned in backend only
          pending_fees: new Decimal(pending_fees),
          university_name: body.university_name || undefined,
          status: body.status || undefined,
          remark: body.remark || undefined,
          enrolled: body.enrolled ?? undefined, // Keep existing if not provided
        },
      });

      // OPTIMIZE: think a way to optimize below things
      if (packageIds.length > 0) {
        await prisma.studentPackage.deleteMany({
          where: { student_id: updatedStudent.id },
        });
        //    b. Create new package records. 
        const packageData = packageIds.map((packageId: string) => ({
          student_id: updatedStudent.id,
          package_id: packageId,
        }));

        if (packageData.length > 0) {
          await prisma.studentPackage.createMany({
            data: packageData,
            // skipDuplicates: true
          });
        }
      }

      if (subjectIds.length > 0) {
        const studentSubjects = await prisma.studentSubject.deleteMany({
          where: { student_id: updatedStudent.id },
        });
        // console.log(studentSubjects);
        //    b. Create new subject records
        const subjectData = subjectIds.map((subjectId: string) => ({
          student_id: updatedStudent.id,
          subject_id: subjectId,
        }));

        if (subjectData.length > 0) {
          await prisma.studentSubject.createMany({
            data: subjectData,
            // skipDuplicates: true
          });
        }
      }
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
