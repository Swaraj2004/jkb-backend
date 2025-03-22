import express, { Request, Response } from 'express';
import { login } from '../controllers/loginController';
import { resetPassword, sendOTPOverEmail, verifyOTP } from '../utils/send_email';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication Management
 *     description: Operations related to user authentication
 */

/**
 * @swagger
 * /login-user:
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
router.post('/login-user', async (req: Request, res: Response) => {
    return login(req, res);
});

/**
 * @swagger
 * /login-status/{user_id}:
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
router.post('/login-status/:user_id', async (req, res) => {
    // const userId = req.params.user_id; // Get user ID from the path parameters
    // const readUserId = convertToBsonId(userId); // Convert the user ID to BSON format
    // const response = await authController.check_login_status(dbInstance, readUserId); // Call the check login status function
    // res.status(200).json(response);
});

/**
 * @swagger
 * /send-otp/{user_email}:
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
router.post('/send-otp/:user_email', async (req, res) => {
    return sendOTPOverEmail(req, res, req.params.user_email);
});

/**
 * @swagger
 * /verify-otp/{user_email}/{otp_code}:
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
router.post('/verify-otp/:user_email/:otp_code', async (req, res) => {
    const userEmail = req.params.user_email;
    const otpCode = req.params.otp_code;
    return verifyOTP(req, res, userEmail, parseInt(otpCode));
});

/**
 * @swagger
 * /reset-password:
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
router.post('/reset-password', async (req, res) => {
    return resetPassword(req, res);
});

export default router;