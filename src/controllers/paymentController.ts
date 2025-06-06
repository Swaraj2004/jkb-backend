import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentBody } from '../models/paymet_req_body';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { STATUS_CODES } from '../utils/consts';

export async function getPaymentById(req: Request, res: Response, paymentId: string): Promise<void> {
  try {
    const payment = await prismaClient.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          select: { email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true, studentDetail: true },      // NOTE: not sending here student packages and subjects
        }
      }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Payment fetched successfully", payment));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
  }
}

export async function getAllPayments(req: Request, res: Response, start_date: string, end_date: string): Promise<void> {
  if (!start_date || !end_date) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Start date and end date are required", null));
    return;
  }
  const startDate = new Date(`${start_date}T00:00:00.000Z`);
  const endDate = new Date(`${end_date}T23:59:59.999Z`);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Invalid date format", null));
    return;
  }

  try {
    const payments = await prismaClient.payment.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        student: {
          select: { email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true, studentDetail: true },
        }
      }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Payments fetched successfully", payments));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
  }
}

export async function getStudentPayments(req: Request, res: Response, userId: string): Promise<void> {
  if (!userId || userId.trim().length === 0) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Student Id Required", null));
    return;
  }
  try {
    const payment = await prismaClient.payment.findMany({
      where: { user_id: userId },
      include: {
        student: {
          select: { email: true, full_name: true, phone: true, location: true, id: true, lastlogin: true, created_at: true, studentDetail: true, },
        },
        subjectPayments: { select: { subject: { select: { name: true, id: true, subject_fees: true } } } },
        packagePayments: { select: { package: { select: { package_name: true, id: true, package_fees: true } } } }
      }
    });

    res.status(STATUS_CODES.SELECT_SUCCESS).json(successJson("Payment fetched successfully", payment));
  } catch (error) {
    res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
  }
}

export async function createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const paymentBody: PaymentBody = req.body;

    // 1. Find the student
    const student = await prismaClient.studentDetail.findUnique({
      where: {
        user_id: paymentBody.student_id     // IMPORTANT: paymentBody.student_id is actually user_id
      },
      select: { pending_fees: true }
    });

    if (!student) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Student not found", null));
      return;
    }

    // 2. Generate receipt number
    const today = new Date();
    const currentYear = today.getFullYear();
    const prefix = paymentBody.is_gst ? "G" : "NG";

    // Find last payment of this type in current year
    const startOfFinancialYear = today >= new Date(currentYear, 3, 15) // 3 = April, 15th April
      ? new Date(currentYear, 3, 15)
      : new Date(currentYear - 1, 3, 15);

    const endOfFinancialYear = new Date(startOfFinancialYear.getFullYear() + 1, 3, 14, 23, 59, 59, 999); // next year 14 April

    const nextYear = (startOfFinancialYear.getFullYear() + 1) % 100;       // to get last 2 nums of the year eg - 2025 -> 26

    const lastPayment = await prismaClient.payment.findFirst({
      where: {
        is_gst: paymentBody.is_gst,
        created_at: {
          gte: startOfFinancialYear,
          lt: endOfFinancialYear
        }
      },
      orderBy: { created_at: 'desc' },
    });

    let receiptNumber: string;
    if (lastPayment && lastPayment.receipt_number) {
      const lastSeq = parseInt(lastPayment.receipt_number.slice(-4));
      receiptNumber = `${prefix}${currentYear}${nextYear}${(lastSeq + 1).toString().padStart(4, '0')}`;
    } else {
      receiptNumber = `${prefix}${currentYear}${nextYear}0001`;
    }

    // 3. Validate payment amount
    const pendingFees = new Decimal(student.pending_fees || 0);
    const amountPaid = new Decimal(paymentBody.amount);

    if (pendingFees.lessThan(amountPaid)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Amount paid cannot be greater than pending fees", null));
      return;
    }

    const newPendingFees = pendingFees.minus(amountPaid);

    const payment = await prismaClient.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.payment.create({
        data: {
          receipt_number: receiptNumber,
          amount: amountPaid,
          status: paymentBody.status,
          mode: paymentBody.mode,
          remark: paymentBody.remark,
          is_gst: paymentBody.is_gst,
          pending: newPendingFees,
          user_id: paymentBody.student_id,
          created_by: paymentBody.staff_id == null ? req.user?.user_id : paymentBody.staff_id, // review this i am adding staff_id from body to created_by col
          subjectPayments: {
            create: paymentBody.subjects.map((subjectId: string) => ({
              subject: { connect: { id: subjectId } }
            }))
          },
          packagePayments: {
            create: paymentBody.packages.map((packageId: string) => ({
              package: { connect: { id: packageId } }
            }))
          }
        },
      });

      // Update student record
      await tx.studentDetail.update({
        where: { user_id: paymentBody.student_id },
        data: {
          pending_fees: newPendingFees,
          enrolled: true              // important handle it in post,delete
        }
      });

      return newPayment;
    });

    res.status(STATUS_CODES.CREATE_SUCCESS).json(successJson("Payment created successfully", payment.id));
  } catch (error) {
    res.status(STATUS_CODES.CREATE_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
  }
}

// export async function deletePayment(req: Request, res: Response, paymentId: string): Promise<void> {
//   if (!paymentId || paymentId.trim().length === 0) {
//     res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Payment Id Required", null));
//     return;
//   }
//
//   try {
//     // TODO: if total payments of the student are 0 then make enrolled of studentDetail false
//     // 1. Find the payment record
//     const payment = await prismaClient.payment.findUnique({
//       where: { id: paymentId },
//       select: { id: true, amount: true, user_id: true }
//     });
//
//     if (!payment || !payment.amount) {
//       res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Payment not found", null));
//       return;
//     }
//
//     // 2. Find the associated student
//     const student = await prismaClient.studentDetail.findUnique({
//       where: { user_id: payment.user_id },
//       select: { pending_fees: true }
//     });
//
//     if (!student || !student.pending_fees) {
//       res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Student not found", null));
//       return;
//     }
//
//     // 3. Calculate updates
//     const updatedPendingFees = student.pending_fees.plus(payment.amount);
//
//     // 4. Execute transaction
//     await prismaClient.$transaction(async (tx): Promise<void> => {
//       await tx.payment.delete({
//         where: { id: paymentId }
//       });
//
//       const remainingPaymentCount = await tx.payment.count({
//         where: { user_id: payment.user_id }
//       });
//
//       const enrolled = remainingPaymentCount > 0;
//
//       // Update student details first
//       await tx.studentDetail.update({
//         where: { user_id: payment.user_id },
//         data: { pending_fees: updatedPendingFees, enrolled: enrolled }
//       });
//     });
//
//     res.status(STATUS_CODES.DELETE_SUCCESS).json(successJson("Payment deleted successfully", 1));
//   } catch (error) {
//     res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
//   }
// }

// WARN: Ravi sir did the student_fees caclulation here but I have done none
export async function editPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id, ...paymentData } = req.body as PaymentBody & { id: string };

    // 1. Get existing payment and student
    const existingPayment = await prismaClient.payment.findUnique({
      where: { id: id },
      select: { amount: true, user_id: true }
    });

    if (!existingPayment || !existingPayment.amount) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Payment record not found or payment amount is null", null));
      return;
    }

    if (!existingPayment.user_id) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("User Id is null that is that user has been Deleted!", null));
      return;
    }

    const student = await prismaClient.studentDetail.findUnique({
      where: { user_id: existingPayment.user_id },
      select: { pending_fees: true }
    });

    if (!student) {
      res.status(STATUS_CODES.SELECT_FAILURE).json(errorJson("Student not found", null));
      return;
    }
    if (!student.pending_fees || student.pending_fees.lessThanOrEqualTo(0)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Student has no pending fees to pay", null));
      return;
    }

    // 2. Calculate adjusted pending fees
    const previousAmount = existingPayment.amount;
    const newAmount = new Decimal(paymentData.amount);
    let pendingFees = student.pending_fees.plus(previousAmount).minus(newAmount);   // calculation

    if (pendingFees.lessThan(0)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Amount paid cannot be greater than pending fees", null));
      return;
    }

    // 3. Update payment and student in transaction
    await prismaClient.$transaction(async (tx): Promise<void> => {
      // Update payment record
      const payment = await tx.payment.update({
        where: { id: id },
        data: {
          mode: paymentData.mode,
          amount: newAmount,
          is_gst: paymentData.is_gst,
          status: paymentData.status,
          pending: pendingFees,
          remark: paymentData.remark,
          // receipt_number should not be updated as it's generated
          created_by: paymentData.staff_id == null ? req.user?.user_id : paymentData.staff_id
        }
      });

      // Update student pending fees
      await tx.studentDetail.update({
        where: { user_id: existingPayment.user_id! },
        data: { pending_fees: pendingFees }
      });
    });

    res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Payment updated successfully", 1));
  } catch (error) {
    res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
  }
}
