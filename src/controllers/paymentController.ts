import { Request, Response } from 'express';
import { errorJson, successJson } from '../utils/common_funcs';
import { prismaClient } from '../utils/database';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentBody } from '../models/paymet_req_body';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export async function getPaymentById(req: Request, res: Response, paymentId: string) {
    try {
        const payment = await prismaClient.payment.findUnique({
            where: { id: paymentId }
        });

        res.status(200).json(successJson("Payment fetched successfully", payment));
    } catch (error) {
        res.status(500).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}

export async function getAllPayments(req: Request, res: Response, start_date: string, end_date: string) {
    if (!start_date || !end_date) {
        res.status(400).json(errorJson("Start date and end date are required", null));
        return;
    }
    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json(errorJson("Invalid date format", null));
        return;
    }

    try {
        const payments = await prismaClient.payment.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        res.status(200).json(successJson("Payments fetched successfully", payments));
    } catch (error) {
        res.status(500).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}

export async function getStudentPayments(req: Request, res: Response, studentId: string) {
    if (!studentId || studentId.trim().length === 0) {
        res.status(400).json(errorJson("Student Id Required", null));
        return;
    }
    try {
        const payment = await prismaClient.payment.findFirst({
            where: { student_id: studentId }
        });

        res.status(200).json(successJson("Payment fetched successfully", payment));
    } catch (error) {
        res.status(500).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}

export async function createPayment(req: AuthenticatedRequest, res: Response) {
    try {
        const paymentBody: PaymentBody = req.body;

        // 1. Find the student
        const student = await prismaClient.studentDetail.findUnique({
            where: { id: paymentBody.student_id },
            select: { pending_fees: true }
        });

        if (!student) {
            res.status(404).json(errorJson("Student not found", null));
            return;
        }

        // 2. Generate receipt number
        const currentYear = new Date().getFullYear();
        const nextYear = (currentYear % 100) + 1;       // to get last 2 nums of the year eg - 2025 -> 26
        const prefix = paymentBody.is_gst ? "G" : "NG";

        // Find last payment of this type in current year
        const lastPayment = await prismaClient.payment.findFirst({
            where: {
                is_gst: paymentBody.is_gst,
                created_at: {
                    gte: new Date(`${currentYear}-01-01`),
                    lt: new Date(`${currentYear + 1}-01-01`)
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
            res.status(400).json(errorJson("Amount paid cannot be greater than pending fees", null));
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
                    pending: !newPendingFees.eq(0),
                    student_id: paymentBody.student_id,
                    created_by: paymentBody.staff_id == null ? req.user?.id : paymentBody.staff_id, // review this i am adding staff_id from body to created_by col
                }
            });

            // Update student record
            await tx.studentDetail.update({
                where: { id: paymentBody.student_id },
                data: { pending_fees: newPendingFees, }
            });

            return newPayment;
        });

        res.status(201).json(successJson("Payment created successfully", payment.id));
    } catch (error) {
        res.status(500).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}

export async function deletePayment(req: Request, res: Response, paymentId: string) {
    if (!paymentId || paymentId.trim().length === 0) {
        res.status(400).json(errorJson("Payment Id Required", null));
        return;
    }

    if (!paymentId || paymentId.trim().length === 0) {
        res.status(400).json(errorJson("Payment Id Required", null));
        return;
    }

    try {
        // 1. Find the payment record
        const payment = await prismaClient.payment.findUnique({
            where: { id: paymentId },
            select: { id: true, amount: true, student_id: true }
        });

        if (!payment || !payment.amount) {
            res.status(404).json(errorJson("Payment not found", null));
            return;
        }

        // 2. Find the associated student
        const student = await prismaClient.studentDetail.findUnique({
            where: { id: payment.student_id },
            select: { pending_fees: true }
        });

        if (!student || !student.pending_fees) {
            res.status(404).json(errorJson("Student not found", null));
            return;
        }

        // 3. Calculate updates
        const updatedPendingFees = student.pending_fees.plus(payment.amount);

        // 4. Execute transaction
        await prismaClient.$transaction(async (tx) => {
            // Update student details first
            await tx.studentDetail.update({
                where: { id: payment.student_id },
                data: { pending_fees: updatedPendingFees, }
            });

            // Then delete payment
            await tx.payment.delete({
                where: { id: paymentId }
            });
        });

        res.status(200).json(successJson("Payment deleted successfully", 1));
    } catch (error) {
        res.status(500).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}

export async function editPayment(req: AuthenticatedRequest, res: Response) {
    try {
        const { record_id, ...paymentData } = req.body as PaymentBody & { record_id: string };

        // 1. Get existing payment and student
        const existingPayment = await prismaClient.payment.findUnique({
            where: { id: record_id },
            select: { amount: true, student_id: true }
        });

        if (!existingPayment || !existingPayment.amount) {
            res.status(404).json(errorJson("Payment record not found or payment amount is null", null));
            return;
        }

        const student = await prismaClient.studentDetail.findUnique({
            where: { id: existingPayment.student_id },
            select: { pending_fees: true }
        });

        if (!student) {
            res.status(404).json(errorJson("Student not found", null));
            return;
        }
        if (!student.pending_fees || student.pending_fees.lessThanOrEqualTo(0)) {
            res.status(400).json(errorJson("Student has no pending fees to pay", null));
            return;
        }

        // 2. Calculate adjusted pending fees
        const previousAmount = existingPayment.amount;
        const newAmount = new Decimal(paymentData.amount);
        let pendingFees = student.pending_fees.plus(previousAmount).minus(newAmount);   // calculation

        if (pendingFees.lessThan(0)) {
            res.status(400).json(errorJson("Amount paid cannot be greater than pending fees", null));
            return;
        }

        // 3. Update payment and student in transaction
        await prismaClient.$transaction(async (tx) => {
            // Update payment record
            const payment = await tx.payment.update({
                where: { id: record_id },
                data: {
                    mode: paymentData.mode,
                    amount: newAmount,
                    is_gst: paymentData.is_gst,
                    status: paymentData.status,
                    pending: !pendingFees.eq(0),
                    remark: paymentData.remark,
                    // receipt_number should not be updated as it's generated
                    created_by: paymentData.staff_id == null ? req.user?.id : paymentData.staff_id
                }
            });

            // Update student pending fees
            await tx.studentDetail.update({
                where: { id: existingPayment.student_id },
                data: { pending_fees: pendingFees }
            });

            return payment;
        });

        res.status(200).json(successJson("Payment updated successfully", 1));
    } catch (error) {
        res.status(500).json(errorJson("Internal server error", error instanceof Error ? error.message : error));
    }
}