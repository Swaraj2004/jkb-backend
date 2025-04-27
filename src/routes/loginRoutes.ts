import express, { Request, Response } from 'express';
import { checkLoginStatus, login } from '../controllers/loginController';
import { resetPassword, sendOTPOverEmail, verifyOTP } from '../utils/send_email';
import { STATUS_CODES } from '../utils/consts';
import { errorJson } from '../utils/common_funcs';

const router = express.Router();


/**
 * @swagger
 * tags:
 *   - name: Authentication Management
 *     description: Operations related to user authentication
 */

/**
 * @swagger
 * /api/v3/auth/login-user:
 *   post:
 *     tags: [Authentication Management]
 *     summary: Log in a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginTemplate'
 *     responses:
 *       200:
 *         description: User logged in successfully
 */

// function is incomplete and not tested
router.post('/login-user', async (req: Request, res: Response): Promise<void> => {
  return login(req, res);
});

/**
 * @swagger
 * /api/v3/auth/login-status/{user_id}:
 *   post:
 *     tags: [Authentication Management]
 *     summary: Check login status of a user
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         description: The ID of the user to get status for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User login status
 */
router.post('/login-status/:user_id', async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.user_id;
  return checkLoginStatus(req, res, userId);
});

/**
 * @swagger
 * /api/v3/auth/send-otp/{user_email}:
 *   post:
 *     tags: [Authentication Management]
 *     summary: Send OTP over email
 *     parameters:
 *       - in: path
 *         name: user_email
 *         required: true
 *         description: The email of the user to send OTP to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post('/send-otp/:user_email', async (req: Request, res: Response): Promise<void> => {
  return sendOTPOverEmail(req, res, req.params.user_email);
});

/**
 * @swagger
 * /api/v3/auth/verify-otp/{user_email}/{otp_code}:
 *   post:
 *     tags: [Authentication Management]
 *     summary: Verify OTP code
 *     parameters:
 *       - in: path
 *         name: user_email
 *         required: true
 *         description: The email of the user to verify OTP for
 *         schema:
 *           type: string
 *       - in: path
 *         name: otp_code
 *         required: true
 *         description: OTP code to verify
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post('/verify-otp/:user_email/:otp_code', async (req: Request, res: Response): Promise<void> => {
  const userEmail = req.params.user_email;
  const otpCode = req.params.otp_code;
  return verifyOTP(req, res, userEmail, parseInt(otpCode));
});

/**
 * @swagger
 * /api/v3/auth/reset-password:
 *   post:
 *     tags: [Authentication Management]
 *     summary: Reset user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordResetTemplate'
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { email_address, password } = req.query;
  if (!email_address || !password) {
    res.status(STATUS_CODES.BAD_REQUEST).json(errorJson("Email address and Password required!", null));
    return;
  }
  return resetPassword(req, res, email_address as string, password as string);
});

export default router;
