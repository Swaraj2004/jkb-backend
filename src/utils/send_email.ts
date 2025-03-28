import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { prismaClient } from "../utils/database";
import { errorJson, generateOTP, successJson } from "./common_funcs";
import { hash } from 'bcrypt';
import { SALT } from "./consts";

export async function sendOTPOverEmail(req: Request, res: Response, email:string) {
    try {
        const user = await prismaClient.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(404).json(errorJson("User record not found!", null));
            return;
        }

        const otp = generateOTP(4);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

        // We use Prisma’s upsert method so that if an OTP record already exists for the user
        // (using user_id as unique), it is updated; otherwise, a new record is created.
        await prismaClient.user.update({
            where: { id: user.id },
            data: { otp_code: otp, },
        });

        const subject = "OTP for password reset";
        const body = `Your OTP code is: ${otp}`;
        const fromEmail = process.env.FROM_EMAIL || "personalmail@gmail.com";
        const smtpServer = process.env.SMTP_SERVER || "smtp.gmail.com";
        const smtpPort = parseInt(process.env.SMTP_PORT || "587");
        const emailPassword = process.env.GMAIL_APP_PASSWORD;

        const emailSent = await sendEmail(subject, body, email, fromEmail, smtpServer, smtpPort, emailPassword);

        if (emailSent) {
            res.status(200).json(successJson("OTP sent successfully!", null));
        } else {
            res.status(500).json(errorJson("Error in sending email!", null));
        }
    } catch (error) {
        res.status(500).json(errorJson("Error creating OTP record", error));
    }
}

async function sendEmail(
    subject: string,
    body: string,
    to: string,
    from: string,
    smtpServer: string,
    smtpPort: number,
    password: string | undefined
): Promise<boolean> {
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail",
            host: smtpServer,
            port: smtpPort,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: from,
                pass: password,
            },
        });
        // console.log("Email first: ", transporter.MailMessage);

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            text: body,
        });
        // console.log("Email sent: ", info.response);
        return true;
    } catch (error) {
        // console.error("Error sending email:", error);
        return false;
    }
}

export async function verifyOTP(req: Request, res: Response, userEmail: string, otp: number) {
    try {
        const otpDetails = await prismaClient.user.findUnique({
            where: { email: userEmail },
        });

        if (!otpDetails || !otpDetails.otp_code) {
            res.status(400).json(errorJson("OTP not found", null));
            return;
        }

        if (parseInt(otpDetails.otp_code) !== otp) {
            res.status(400).json(errorJson("Invalid OTP", null));
            return;
        }

        // if (new Date(otpDetails.expires_at) < new Date()) {
        //     res.status(400).json(errorJson("OTP expired", null));
        //     return;
        // }

        res.status(200).json(successJson("OTP verified successfully", null));
    } catch (error) {
        res.status(500).json(errorJson("Error verifying OTP", error));
    }
}
export async function resetPassword(req: Request, res: Response) {
    try {
        const { email_address, password } = req.body;

        const userRecord = await prismaClient.user.findUnique({
            where: { email: email_address },
        });

        if (!userRecord) {
            res.status(404).json(errorJson("User Record Not Found", null));
            return;
        }

        const newPassword = await hash(password, SALT);

        // Update the user's password
        await prismaClient.user.update({
            where: { id: userRecord.id },
            data: { password: newPassword },
        });

        res.status(200).json(successJson("Password Reset Successfully!", null));
    } catch (error: any) {
        res.status(500).json(errorJson("Error resetting password", error.message));
    }
}
