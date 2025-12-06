import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentBody } from '../models/paymet_req_body';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { STATUS_CODES } from '../utils/consts';

export async function getPaymentById(
  req: Request,
  res: Response,
  paymentId: string
): Promise<void> {
  try {
    const payment = await prismaClient.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          select: {
            email: true,
            full_name: true,
            phone: true,
            location: true,
            id: true,
            lastlogin: true,
            created_at: true,
            studentDetail: true,
          }, // NOTE: not sending here student packages and subjects
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Payment fetched successfully', payment));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export async function getAllPayments(
  req: Request,
  res: Response,
  start_date: string,
  end_date: string
): Promise<void> {
  if (!start_date || !end_date) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json(errorJson('Start date and end date are required', null));
    return;
  }
  const startDate = new Date(`${start_date}T00:00:00.000Z`);
  const endDate = new Date(`${end_date}T23:59:59.999Z`);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json(errorJson('Invalid date format', null));
    return;
  }

  try {
    const payments = await prismaClient.payment.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        student: {
          select: {
            email: true,
            full_name: true,
            phone: true,
            location: true,
            id: true,
            lastlogin: true,
            created_at: true,
            studentDetail: true,
          },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Payments fetched successfully', payments));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export async function getStudentPayments(
  req: Request,
  res: Response,
  userId: string,
  year: string
): Promise<void> {
  if (!userId || userId.trim().length === 0 || !year) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json(errorJson('Student Id & year required Required', null));
    return;
  }
  try {
    const numYear = parseInt(year);
    if (isNaN(numYear)) {
      res.status(STATUS_CODES.BAD_REQUEST).json(errorJson('year is NaN', null));
      return;
    }
    const fee = await prismaClient.fee.findUnique({
      where: {
        year_student_id: {
          student_id: userId,
          year: numYear,
        },
      },
      select: {
        id: true,
        student_fees: true,
        total_fees: true,
        payments: {
          select: {
            id: true,
            fee_id: true,
            receipt_number: true,
            amount: true,
            mode: true,
            status: true,
            is_gst: true,
            user_id: true,
            remark: true,
            pending: true,
            created_by: true,
            created_at: true,
            student: {
              select: {
                email: true,
                full_name: true,
                phone: true,
                location: true,
                id: true,
                lastlogin: true,
                created_at: true,
                studentDetail: true,
              },
            },
            subjectPayments: {
              select: {
                subject: {
                  select: { name: true, id: true, subject_fees: true },
                },
              },
            },
            packagePayments: {
              select: {
                package: {
                  select: { package_name: true, id: true, package_fees: true },
                },
              },
            },
          },
        },
      },
    });

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('Payment fetched successfully', fee));
  } catch (error) {
    // console.error(error);
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export async function createPayment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const paymentBody: PaymentBody = req.body;

    if (
      !paymentBody.student_id ||
      !paymentBody.user_id ||
      !paymentBody.year ||
      !paymentBody.amount
    ) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('user_id, student_id, amount and year required', null));
      return;
    }

    // 1. Find the fee
    const fee = await prismaClient.fee.findUnique({
      where: {
        year_student_id: {
          year: paymentBody.year,
          student_id: paymentBody.student_id,
        },
      },
      select: {
        id: true,
        student_fees: true,
        total_fees: true,
        payments: true,
      },
    });

    // NOTE: the fee is created in the endpoint: /api/v3/admin/subject-package
    if (!fee) {
      res
        .status(STATUS_CODES.CREATE_FAILURE)
        .json(
          errorJson(
            'first select student Package or Subjects for the year and student_id selected.',
            null
          )
        );
      return;
    }

    // 2. Validate payment amount
    let feesPaid = new Decimal(0);
    for (const payment of fee.payments)
      feesPaid = feesPaid.plus(payment.amount ?? new Decimal(0));

    const currentAmount = new Decimal(paymentBody.amount);
    if (currentAmount.plus(feesPaid).greaterThan(fee.student_fees)) {
      // NOTE: in future instead of returning null we can return the amount limit that can be set by student_fees - amountPaid
      res
        .status(STATUS_CODES.CREATE_FAILURE)
        .json(
          errorJson(
            'amount cannot be greaterThan than (student_fees - previously Paid Payments).',
            null
          )
        );
      return;
    }

    // 3. Generate receipt number
    const today = new Date();
    const currentYear = today.getFullYear();
    // const currentYear = paymentBody.year;
    const prefix = paymentBody.is_gst ? 'G' : 'NG';

    // Find last payment of this type in current year
    const startOfFinancialYear =
      today >= new Date(currentYear, 3, 15) // 3 = April, 15th April
        ? new Date(currentYear, 3, 15)
        : new Date(currentYear - 1, 3, 15);

    const endOfFinancialYear = new Date(
      startOfFinancialYear.getFullYear() + 1,
      3,
      14,
      23,
      59,
      59,
      999
    ); // next year 14 April

    const nextYear = (startOfFinancialYear.getFullYear() + 1) % 100; // to get last 2 nums of the year eg - 2025 -> 26

    const lastPayment = await prismaClient.payment.findFirst({
      where: {
        is_gst: paymentBody.is_gst,
        created_at: {
          gte: startOfFinancialYear,
          lt: endOfFinancialYear,
        },
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

    const newPendingFees = fee.student_fees.minus(feesPaid.plus(currentAmount)); // imp

    const payment = await prismaClient.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.payment.create({
        data: {
          receipt_number: receiptNumber,
          amount: currentAmount,
          status: paymentBody.status ?? undefined,
          mode: paymentBody.mode ?? undefined,
          remark: paymentBody.remark ?? undefined,
          is_gst: paymentBody.is_gst,
          pending: newPendingFees,
          user_id: paymentBody.user_id,
          fee_id: fee.id,
          created_by:
            paymentBody.staff_id == null
              ? req.user?.user_id
              : paymentBody.staff_id, // review this i am adding staff_id from body to created_by col
          // subjectPayments: {
          //   create: paymentBody.subjects.map((subjectId: string) => ({
          //     subject: { connect: { id: subjectId } }
          //   }))
          // },
          // packagePayments: {
          //   create: paymentBody.packages.map((packageId: string) => ({
          //     package: { connect: { id: packageId } }
          //   }))
          // }
        },
      });

      // Update student record
      await tx.studentDetail.update({
        where: { user_id: paymentBody.user_id },
        data: {
          pending_fees: newPendingFees,
          enrolled: true, // important handle it in post,delete
        },
      });

      return newPayment;
    });

    res
      .status(STATUS_CODES.CREATE_SUCCESS)
      .json(successJson('Payment created successfully', payment.id));
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Internal server error', null));
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
//     res.status(STATUS_CODES.DELETE_FAILURE).json(errorJson("Internal server error", null));
//   }
// }

// WARN: Ravi sir did the student_fees caclulation here but I have done none
export async function editPayment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { id, ...paymentData } = req.body as PaymentBody & { id: string };

    // 1. Get existing payment and student
    const existingPayment = await prismaClient.payment.findUnique({
      where: { id: id },
      select: { amount: true, user_id: true },
    });

    if (!existingPayment || !existingPayment.amount) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(
          errorJson('Payment record not found or payment amount is null', null)
        );
      return;
    }

    if (!existingPayment.user_id) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson('User Id is null that is that user has been Deleted!', null)
        );
      return;
    }

    const student = await prismaClient.studentDetail.findUnique({
      where: { user_id: existingPayment.user_id },
      select: { pending_fees: true },
    });

    if (!student) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('Student not found', null));
      return;
    }
    if (!student.pending_fees || student.pending_fees.lessThanOrEqualTo(0)) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('Student has no pending fees to pay', null));
      return;
    }

    // 2. Calculate adjusted pending fees
    const previousAmount = existingPayment.amount;
    const newAmount = new Decimal(paymentData.amount);
    let pendingFees = student.pending_fees
      .plus(previousAmount)
      .minus(newAmount); // calculation

    if (pendingFees.lessThan(0)) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(
          errorJson('Amount paid cannot be greater than pending fees', null)
        );
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
          created_by:
            paymentData.staff_id == null
              ? req.user?.user_id
              : paymentData.staff_id,
        },
      });

      // Update student pending fees
      await tx.studentDetail.update({
        where: { user_id: existingPayment.user_id! },
        data: { pending_fees: pendingFees },
      });
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Payment updated successfully', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Internal server error', null));
  }
}

export const editStudentFees = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { student_id, year, student_fees } = req.body;

  if (!student_id || !year) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json(errorJson('studentDetail id and year required', null));
    return;
  }
  try {
    const numYear = parseInt(year);
    const studentFees = parseInt(student_fees);
    if (isNaN(numYear) || isNaN(studentFees)) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('year or student_fees is NaN', null));
      return;
    }

    const fee = await prismaClient.fee.findUnique({
      where: {
        year_student_id: {
          year: numYear,
          student_id: student_id,
        },
      },
      select: {
        id: true,
        payments: true,
        student_fees: true,
        total_fees: true,
      },
    });

    if (!fee) {
      res
        .status(STATUS_CODES.UPDATE_FAILURE)
        .json(errorJson('year is NaN', null));
      return;
    }

    const studentFeesDecimal = new Decimal(studentFees);

    if (studentFeesDecimal.greaterThan(fee.total_fees)) {
      res
        .status(STATUS_CODES.UPDATE_FAILURE)
        .json(
          errorJson(
            'student_fees cannot be greater than than total_fees.',
            null
          )
        );
      return;
    }

    let feesPaid: Decimal = new Decimal(0);
    for (const payment of fee.payments)
      feesPaid = feesPaid.plus(payment.amount ?? new Decimal(0));

    if (studentFeesDecimal.lessThan(feesPaid)) {
      res
        .status(STATUS_CODES.UPDATE_FAILURE)
        .json(
          errorJson(
            'student_fees cannot be less than the fees aldready paid.',
            null
          )
        );
      return;
    }

    await prismaClient.fee.update({
      where: { id: fee.id },
      data: { student_fees: studentFeesDecimal },
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Student Fees edited Successfully!', 1));
  } catch (error) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Edit student fees failed', null));
  }
};

// // NOTE: this was just made to fix the Fee table
// interface FeeBody {
//   student_id: string;
//   student_fees: Decimal;
//   total_fees: Decimal;
//   year: number;
// }
// export const fixFeeTable = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // 1. get all studentDetails
//     const studentDetails = await prismaClient.studentDetail.findMany({
//       select: {
//         id: true,
//         student_fees: true,
//         studentPackages: {
//           select: {
//             year: true,
//             package: { select: { package_fees: true } }
//           }
//         },
//         studentSubjects: {
//           select: {
//             year: true,
//             subject: { select: { subject_fees: true } }
//           }
//         },
//         user_id: true,
//         user: {
//           select: { payments: true }
//         }
//       }
//     });
//
//     // 2. create fees for each studentDetails
//     for (const studentDetail of studentDetails) {
//       let fee: FeeBody = {
//         student_id: studentDetail.id,
//         student_fees: studentDetail.student_fees ?? new Decimal(0),
//         total_fees: new Decimal(0),
//         year: 2025
//       }
//
//       if (studentDetail.studentPackages.length !== 0 || studentDetail.studentSubjects.length !== 0) {
//         let totalAmount = new Decimal(0);
//         for (const studentPackage of studentDetail.studentPackages) {
//           totalAmount = totalAmount.plus(studentPackage.package.package_fees);
//           fee.year = Math.min(fee.year, studentPackage.year);
//         }
//         for (const studentSubject of studentDetail.studentSubjects) {
//           totalAmount = totalAmount.plus(studentSubject.subject.subject_fees);
//           fee.year = Math.min(fee.year, studentSubject.year);
//         }
//
//         fee.total_fees = totalAmount;
//       }
//
//       const createdFee = await prismaClient.fee.create({ data: fee });
//
//       if (studentDetail.user.payments?.length) {
//         await prismaClient.payment.updateMany({
//           where: { id: { in: studentDetail.user.payments.map(p => p.id) } },
//           data: { fee_id: createdFee.id }
//         });
//       }
//     }
//
//     res.status(STATUS_CODES.UPDATE_SUCCESS).json(successJson("Fee table fixed Successfully!", 1));
//   } catch (error) {
//     res.status(STATUS_CODES.UPDATE_FAILURE).json(errorJson("failed to fix Fee table", error));
//   }
// }
