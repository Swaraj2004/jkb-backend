import express, { Request, Response } from 'express';
import { createPayment, editPayment, getAllPayments, getPaymentById, getStudentPayments } from '../controllers/paymentController';
import { AuthenticatedRequest, authMiddleware, authorizeRoles } from '../middlewares/authMiddleware';
import { STUDENT_ROLE, STATUS_CODES, ADMIN_ROLE } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';

const router = express.Router();


/**
 * @swagger
 * tags:
 *   - name: Payment Management
 *     description: Admin access only
 */

/**
 * @swagger
 * /api/v3/payments/{payment_id}:
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
router.get('/admin/payments/:payment_id', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  const paymentId = req.params.payment_id;
  return getPaymentById(req, res, paymentId);
});

/**
 * @swagger
 * /api/v3/payments:
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
router.get('/admin/payments', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: Request, res: Response): Promise<void> => {
  const { start_date, end_date } = req.query;
  return getAllPayments(req, res, start_date as string, end_date as string);
});

/**
 * @swagger
 * /api/v3/student-payments/{student_id}:
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
router.get('/admin/student-payments/:user_id', authMiddleware, authorizeRoles([ADMIN_ROLE, STUDENT_ROLE]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.params.user_id;
  if (req.user!.role_name == STUDENT_ROLE && userId != req.user!.user_id) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Can't see other Students Payments", null));
    return;
  }
  return getStudentPayments(req, res, userId);
});

/**
 * @swagger
 * /api/v3/payments:
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
router.post('/admin/payments', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return createPayment(req, res);
});

/**
 * @swagger
 * /api/v3/payments/{payment_id}:
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
// router.delete('/admin/payments/:payment_id', authMiddleware, authorizeRoles(), async (req: Request, res: Response): Promise<void> => {
//   const paymentId = req.params.payment_id;
//   return deletePayment(req, res, paymentId);
// });
//
/**
 * @swagger
 * /api/v3/payments:
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
router.put('/admin/payments', authMiddleware, authorizeRoles([ADMIN_ROLE]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return editPayment(req, res);
});

/**
 * @swagger
 * /api/v3/student/payments:
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
router.get('/student/payments', authMiddleware, authorizeRoles([ADMIN_ROLE, STUDENT_ROLE]), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  // TODO: here other student can see any student details fix this
  const studentId = req.query.student_id as string;
  return getStudentPayments(req, res, studentId);
});

export default router;
