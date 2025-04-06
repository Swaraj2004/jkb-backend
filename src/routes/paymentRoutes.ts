import express, { Request, Response } from 'express';
import { createPayment, deletePayment, editPayment, getAllPayments, getPaymentById, getStudentPayments } from '../controllers/paymentController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { STUDENT_ROLE } from '../utils/consts';
import { BASE_URLS } from '../swagger/swaggerConfig';

const router = express.Router();
const BASE_URL = BASE_URLS.PAYMENT;


/**
 * @swagger
 * tags:
 *   - name: Payment Management
 *     description: Admin access only
 */

/**
 * @swagger
 * ${BASE_URL}/payments/{payment_id}:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get a specific payment by ID
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         description: The ID of the payment to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single payment object
 */
router.get('/admin/payments/:payment_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    const paymentId = req.params.payment_id;
    return getPaymentById(req, res, paymentId);
});

/**
 * @swagger
 * ${BASE_URL}/payments:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get all payments with optional date filtering
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: false
 *         description: Start date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *       - in: query
 *         name: end_date
 *         required: false
 *         description: End date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of payment objects
 */
router.get('/admin/payments', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    const { start_date, end_date } = req.query;
    return getAllPayments(req, res, start_date as string, end_date as string);
});

/**
 * @swagger
 * ${BASE_URL}/student-payments/{student_id}:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payments for a specific student
 *     parameters:
 *       - in: path
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get payments of
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of payment objects for the student
 */
router.get('/admin/student-payments/:user_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    const userId = req.params.user_id;
    return getStudentPayments(req, res, userId);
});

/**
 * @swagger
 * ${BASE_URL}/payments:
 *   post:
 *     tags: [Payment Management]
 *     summary: Create a new payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Payment'
 *     responses:
 *       201:
 *         description: The created payment object
 */
router.post('/admin/payments', authMiddleware, authorizeRoles(), async (req: AuthenticatedRequest, res: Response) => {
    return createPayment(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/payments/{payment_id}:
 *   delete:
 *     tags: [Payment Management]
 *     summary: Delete a payment by ID
 *     parameters:
 *       - in: path
 *         name: payment_id
 *         required: true
 *         description: The ID of the payment to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Payment deleted successfully
 */
router.delete('/admin/payments/:payment_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response) => {
    const paymentId = req.params.payment_id;
    return deletePayment(req, res, paymentId);
});

/**
 * @swagger
 * ${BASE_URL}/payments:
 *   put:
 *     tags: [Payment Management]
 *     summary: Update a payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePayment'
 *     responses:
 *       202:
 *         description: The updated payment object
 */
router.put('/admin/payments', authMiddleware, authorizeRoles(), async (req: AuthenticatedRequest, res: Response) => {
    return editPayment(req, res);
});

/**
 * @swagger
 * ${BASE_URL}/student/payments:
 *   get:
 *     tags: [Payment Management]
 *     summary: Get payments for a specific student
 *     parameters:
 *       - in: query
 *         name: student_id
 *         required: true
 *         description: The ID of the student to get payments for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of payment records for the student
 */
router.get('/student/payments', authMiddleware, authorizeRoles([STUDENT_ROLE]), async (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.query.student_id as string;
    return getStudentPayments(req, res, studentId);
});

export default router;
