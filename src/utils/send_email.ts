import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { prismaClient } from '../utils/database';
import { errorJson, generateOTP, successJson } from './common_funcs';
import { hash } from 'bcrypt';
import {
  emailPassword,
  fromEmail,
  SALT,
  smtpPort,
  smtpServer,
  STATUS_CODES,
} from './consts';

export async function sendOTPOverEmail(
  req: Request,
  res: Response,
  email: string
): Promise<void> {
  try {
    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('User record not found!', null));
      return;
    }

    const otp = generateOTP(4);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // expires in 10 minutes

    // We use Prisma’s upsert method so that if an OTP record already exists for the user
    // (using user_id as unique), it is updated; otherwise, a new record is created.
    await prismaClient.user.update({
      where: { id: user.id },
      data: { otp_code: otp },
    });

    const subject = 'OTP for password reset';
    const body = `Your OTP code is: ${otp}`;
    const emailSent = await sendEmail(
      subject,
      body,
      email,
      fromEmail,
      smtpServer,
      smtpPort,
      emailPassword
    );

    if (emailSent) {
      res
        .status(STATUS_CODES.UPDATE_SUCCESS)
        .json(successJson('OTP sent successfully!', null));
    } else {
      res
        .status(STATUS_CODES.CREATE_FAILURE)
        .json(errorJson('Error in sending email!', null));
    }
  } catch (error) {
    res
      .status(STATUS_CODES.CREATE_FAILURE)
      .json(errorJson('Error creating OTP record', error));
  }
}

export async function sendEmail(
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
      service: 'gmail',
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

export async function verifyOTP(
  req: Request,
  res: Response,
  userEmail: string,
  otp: number
): Promise<void> {
  try {
    const otpDetails = await prismaClient.user.findUnique({
      where: { email: userEmail },
    });

    if (!otpDetails || !otpDetails.otp_code) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('OTP not found', null));
      return;
    }

    if (parseInt(otpDetails.otp_code) !== otp) {
      res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json(errorJson('Invalid OTP', null));
      return;
    }

    // if (new Date(otpDetails.expires_at) < new Date()) {
    //     res.status(400).json(errorJson("OTP expired", null));
    //     return;
    // }

    res
      .status(STATUS_CODES.SELECT_SUCCESS)
      .json(successJson('OTP verified successfully', null));
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Error verifying OTP', error));
  }
}
export async function resetPassword(
  req: Request,
  res: Response,
  email_address: string,
  password: string
): Promise<void> {
  try {
    if (!email_address || !password) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(successJson('Email Address and Password required!', null));
      return;
    }

    const userRecord = await prismaClient.user.findUnique({
      where: { email: email_address },
    });

    if (!userRecord) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('User Record Not Found', null));
      return;
    }

    const newPassword = await hash(password, SALT);

    // Update the user's password
    await prismaClient.user.update({
      where: { id: userRecord.id },
      data: { password: newPassword },
    });

    res
      .status(STATUS_CODES.UPDATE_SUCCESS)
      .json(successJson('Password Reset Successfully!', null));
  } catch (error: any) {
    res
      .status(STATUS_CODES.UPDATE_FAILURE)
      .json(errorJson('Error resetting password', error.message));
  }
}
