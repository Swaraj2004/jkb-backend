import express from 'express';
// import { checkRole } from '../middlewares/authMiddleware'; // Adjust the import based on your project structure
// import authController from '../controllers/authController'; // Adjust the import based on your project structure
// import { LoginTemplate, PasswordResetTemplate } from '../schemas/authSchemas'; // Adjust the import based on your project structure

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
router.post('/login-user', async (req, res) => {
    // const request: LoginTemplate = req.body; // Get login data from the request body
    // const response = await authController.login_user(dbInstance, request); // Call the login function
    // res.status(200).json(response);
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
    // const userEmail = req.params.user_email; // Get user email from the path parameters
    // const response = await authController.send_otp_over_email(dbInstance, userEmail); // Call the send OTP function
    // res.status(200).json(response);
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
    // const userEmail = req.params.user_email; // Get user email from the path parameters
    // const otpCode = req.params.otp_code; // Get OTP code from the path parameters
    // const response = await authController.verify_otp(dbInstance, userEmail, otpCode); // Call the verify OTP function
    // res.status(200).json(response);
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
    // const request: PasswordResetTemplate = req.body; // Get password reset data from the request body
    // const response = await authController.reset_password(dbInstance, request); // Call the reset password function
    // res.status(200).json(response);
});

export default router;
