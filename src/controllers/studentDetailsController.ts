import { PrismaClient, StudentDetail } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { StudentDetailReqBodyModel } from "../models/student_detail_req_body";
import { successJson, errorJson } from "../utils/common_funcs";
import { prismaClient } from "../utils/database";
import { Request, Response } from 'express';
import { STATUS_CODES, STUDENT_ROLE } from "../utils/consts";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

export async function getTotalAmout(packageIds: string[], subjectIds: string[], prisma: PrismaClient): Promise<Decimal> {
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

    // const packageIds = packageYear.map(pkg => pkg.packageId);
    // const subjectIds = subjectYear.map(sub => sub.subjectId);

    let totalAmount = await getTotalAmout(packageIds, subjectIds, prismaClient);
    // console.log(totalAmount);
    const finalAmount = new Decimal(totalAmount);

    const createRecord = {
      user_id: body.student_id, // Assign from request body
      created_at: new Date(),
      updated_at: new Date(),
      parent_contact: body.parent_contact ?? null,
      branch_id: body.branch_id ?? null,
      diploma_score: body.diploma_score ?? null,
      xii_score: body.xii_score ?? null,
      cet_score: body.cet_score ?? null,
      jee_score: body.jee_score ?? null,
      college_name: body.college_name ?? null,
      referred_by: body.referred_by ?? null,
      student_fees: finalAmount,
      total_fees: finalAmount,
      pending_fees: finalAmount,
      jkb_centre: body.jkb_centre ?? null,
      semester: body.semester ?? null,
      university_name: body.university_name ?? null,
      status: body.status ?? null,
      remark: body.remark ?? null,
      enrolled: body.enrolled ?? false,
    };

    const feeYear = body.fee_year ?? new Date().getFullYear();

    const newStudentDetail: StudentDetail = await prismaClient.studentDetail.create({
      data: {
        ...createRecord,
        fees: {
          create: {
            year: body.fee_year ?? new Date().getFullYear(),
            student_fees: finalAmount,
            total_fees: finalAmount,
          }
        },
        studentSubjects: {
          createMany: {
            data: subjectIds.map((subject) => ({
              subject_id: subject,
              year: feeYear
            }))
          }
        },
        studentPackages: {
          createMany: {
            data: packageIds.map((pkgId) => ({
              package_id: pkgId,
              year: feeYear
            }))
          }
        }
      }
    });

    // // PREVIOUSLY:
    // if (subjectIds.length > 0) {
    //   const subjectData = subjectYear.map((subject) => ({
    //     student_id: newStudentDetail.id,
    //     subject_id: subject.subjectId,
    //     year: subject.year ?? new Date().getFullYear()
    //   }));
    //
    //   await prismaClient.studentSubject.createMany({
    //     data: subjectData,
    //   });
    // }
    //
    // if (packageIds.length > 0) {
    //   const packageData = packageYear.map((pkg) => ({
    //     student_id: newStudentDetail.id,
    //     package_id: pkg.packageId,
    //     year: pkg.year ?? new Date().getFullYear()
    //   }));
    //
    //   await prismaClient.studentPackage.createMany({
    //     data: packageData,
    //   });
    // }

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Record Inserted Successfully", newStudentDetail.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson('Error creating student record', null));
  }
}

export async function editStudentDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const body: StudentDetailReqBodyModel = req.body;
  const studentId = body.student_id;
  const student_fees: number | null = body.student_fees;
  // remove power for student to edit student_fees, WARN: there can be a potential security threat to tamper jwt token
  if (req.user!.role_name === STUDENT_ROLE && student_fees !== null && student_fees > 0) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Student can't edit student_fees!", null));
    return;
  }

  try {
    const packageIds = Array.isArray(body.packages) ? body.packages : [];
    const subjectIds = Array.isArray(body.subjects) ? body.subjects : [];

    // const packageIds = packageYear.map(pkg => pkg.packageId);
    // const subjectIds = subjectYear.map(sub => sub.subjectId);

    const studentDetails = await prismaClient.studentDetail.findUnique({
      where: { user_id: studentId },
      select: {
        id: true,
        fees: {
          where: { year: body.fee_year },   // NOTE: there will be only one fee for a particular year due to the constraints
          select: {
            id: true,
            student_fees: true,
            packagePayments: true,
            subjectPayments: true,
            payments: true
          }
        },
      }
    });
    // console.log('here ', studentDetails?.fees);

    if (!studentDetails || (studentDetails.fees?.length ?? 0) === 0) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Student Detail does not exist, or fees for the Student do not exist!", null));
      return;
    }

    const feeRecord = studentDetails.fees[0];

    for (const fee of studentDetails.fees) {
      for (const pkgPay of fee.packagePayments ?? []) {
        // if packagePayments contains a package not present in the incoming packageIds -> error
        if (!packageIds.includes(pkgPay.package_id)) {
          res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("You cannot delete a package that already has a payment.", null));
          return;
        }
      }

      for (const subjPay of fee.subjectPayments ?? []) {
        if (!subjectIds.includes(subjPay.subject_id)) {
          res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("You cannot delete a subject that already has a payment.", null));
          return;
        }
      }
    }

    let amountPaid = new Decimal(0);
    for (const p of feeRecord.payments ?? []) {
      if (p.amount != null)
        amountPaid = amountPaid.plus(p.amount);
    }

    if (student_fees !== null && student_fees !== undefined && student_fees > 0) {
      // const paymentCount = await prismaClient.payment.count({
      //   where: { user_id: studentId }
      // });
      // IMPORTANT: student_fees handling
      if (body.total_fees < student_fees || student_fees < amountPaid.toNumber()) {
        res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("student_fees can't be less that amountPaid or greater than total_fees!", null));
        return;
      }

      // if (paymentCount > 0) {
      //   res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("student_fees can't be edited payment aldready exist of the given student_id", null));
      //   return;
      // }
    }

    const totalAmount = await getTotalAmout(packageIds, subjectIds, prismaClient);
    // IMPORTANT: student_fees cannot be greater than totalAmount
    if (feeRecord.student_fees!.gt(totalAmount) || (student_fees !== null && student_fees !== undefined && student_fees > totalAmount.toNumber())) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("student_fees cannot be greater than the total_fees!", null));
      return;
    }

    const updateData: any = {
      parent_contact: body.parent_contact || undefined,
      branch_id: body.branch_id || undefined,
      diploma_score: body.diploma_score || undefined,
      xii_score: body.xii_score || undefined,
      cet_score: body.cet_score || undefined,
      jee_score: body.jee_score || undefined,
      college_name: body.college_name || undefined,
      referred_by: body.referred_by || undefined,
      total_fees: totalAmount,
      // pending_fees: new Decimal(pending_fees),
      university_name: body.university_name || undefined,
      status: body.status || undefined,
      remark: body.remark || undefined,
      jkb_centre: body.jkb_centre || null,
      semester: body.semester || null,
      enrolled: body.enrolled ?? undefined,
    };

    // Conditionally add `student_fees` only if not null
    if (student_fees !== null && student_fees !== undefined) {
      updateData.student_fees = new Decimal(student_fees);
      updateData.pending_fees = new Decimal(student_fees - amountPaid.toNumber());
    }
    await prismaClient.$transaction(async (prisma): Promise<void> => {
      const updatedStudent = await prisma.studentDetail.update({
        where: { user_id: studentId },
        data: {
          ...updateData,
          fees: {
            update: {
              where: { id: feeRecord.id },
              data: {
                student_fees: updateData.student_fees ?? undefined,
                total_fees: updateData.total_fees ?? undefined,
              }
            }
          }
        },
        select: { id: true }
      });
      // console.log(`id - ${updatedStudent.id}`);

      // when student_fees is updated update the pending_fees in Payment
      // if there are previous transactions update their pending_fees and update them
      if (!updatedStudent) {
        res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Failed to update user", null));
        return;
      }

      const prevPayments = await prisma.payment.findMany({
        where: { user_id: studentId, fee_id: feeRecord.id },
        orderBy: { created_at: "asc" }
      });

      if (prevPayments.length > 0 && (updateData.student_fees !== undefined)) {
        let paymentTillNow = new Decimal(0);
        const paymentUpdates: Promise<any>[] = [];

        for (let i = 0; i < prevPayments.length; i++) {
          const currentPayment = prevPayments[i];

          paymentTillNow = paymentTillNow.plus(currentPayment.amount || new Decimal(0));

          const newPending = (updateData.student_fees || new Decimal(0)).minus(paymentTillNow);

          paymentUpdates.push(
            prisma.payment.update({
              where: { id: currentPayment.id },
              data: {
                pending: newPending,
              }
            })
          );
        }

        // Await all individual update promises.
        await Promise.all(paymentUpdates);
      }

      // OPTIMIZE: think a way to optimize below things
      const feeYear = body.fee_year ?? new Date().getFullYear();
      // first delete all packages and subjects
      await prisma.studentPackage.deleteMany({
        where: { student_id: updatedStudent.id, year: feeYear },
      });
      await prisma.studentSubject.deleteMany({
        where: { student_id: updatedStudent.id, year: feeYear },
      });

      if (packageIds.length > 0) {
        //    b. Create new package records. 
        const packageData = packageIds.map((pkgId) => ({
          student_id: updatedStudent.id,
          package_id: pkgId,
          year: feeYear
        }));

        if (packageData.length > 0) {
          await prisma.studentPackage.createMany({
            data: packageData,
            // skipDuplicates: true
          });
        }
      }

      if (subjectIds.length > 0) {
        // console.log(studentSubjects);
        //    b. Create new subject records
        const subjectData = subjectIds.map((subjectId) => ({
          student_id: updatedStudent.id,
          subject_id: subjectId,
          year: feeYear
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
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Error updating student record", null));
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
    res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Error deleting student record", null));
  }
}

// Get all StudentDetail records
export async function getAllStudentDetails(req: Request, res: Response): Promise<void> {
  try {
    const studentDetails: StudentDetail[] = await prismaClient.studentDetail.findMany();
    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Records fetched successfully", studentDetails));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Error fetching student records", null));
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
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Error fetching student record", null));
  }
}
