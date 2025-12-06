import { compare } from 'bcrypt';
import { format, toZonedTime } from 'date-fns-tz';
import { Request, Response } from 'express';
import { errorJson } from '../utils/common_funcs';
import {
  ACCESS_TOKEN_EXPIRE_MINUTES,
  STATUS_CODES,
  TZ_INDIA,
} from '../utils/consts';
import { prismaClient } from '../utils/database';
import { TokenPayload } from '../utils/jwt_payload';
import { createAccessToken } from '../utils/jwt_token';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const userRecord = await prismaClient.user.findUnique({
      where: { email: email },
    });

    if (!userRecord) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('User Record Not Found', null));
      return;
    }

    const passwordMatch = await compare(password, userRecord.password);
    if (!passwordMatch) {
      res.status(401).json(errorJson('Invalid Credentials', null));
      return;
    }

    const studentDetail = await prismaClient.studentDetail.findUnique({
      where: { user_id: userRecord.id },
    });

    // Fetch the first user role associated with the given user_id and include the related role details
    const userRole = await prismaClient.userRole.findFirst({
      where: { user_id: userRecord.id },
      include: { role: true }, // Fetch associated role details in a single query
    });

    if (!userRole) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('User Record Not Found', null));
      return;
    }

    const tokenPayload: TokenPayload = {
      user_id: userRecord.id,
      // full_name: userRecord.full_name ?? "user",
      role_name: userRole.role.name,
    };
    const accessToken = createAccessToken(
      tokenPayload,
      ACCESS_TOKEN_EXPIRE_MINUTES
    );

    const now = toZonedTime(new Date(), TZ_INDIA); // Convert to Indian timezone

    // Update login status record.
    await prismaClient.user.update({
      where: { id: userRecord.id },
      data: { lastlogin: now },
    });

    // Build the response payload.
    const result = {
      success: true,
      message: 'Login Successful',
      full_name: userRecord.full_name,
      email: userRecord.email,
      user_id: userRecord.id,
      role_id: userRole.role_id,
      user_detail_id: studentDetail ? studentDetail.id : '',
      role_name: userRole.role.name,
      expire_minutes: ACCESS_TOKEN_EXPIRE_MINUTES,
      current_timestamp: format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", {
        timeZone: TZ_INDIA,
      }),
      access_token: accessToken,
      token_type: 'Bearer',
    };

    res.status(STATUS_CODES.SELECT_SUCCESS).json(result);
  } catch (error) {
    res
      .status(STATUS_CODES.SELECT_FAILURE)
      .json(errorJson('Failed to login user', null));
  }
}

export async function checkLoginStatus(
  req: Request,
  res: Response,
  userId: string
): Promise<void> {
  try {
    const userLoginDetail = await prismaClient.user.findFirst({
      where: { id: userId },
      select: { lastlogin: true },
    });

    if (!userLoginDetail || !userLoginDetail.lastlogin) {
      res
        .status(STATUS_CODES.SELECT_FAILURE)
        .json(errorJson('User Record Not Found or lastLogin not found', null));
      return;
    }

    const lastLogin = new Date(userLoginDetail.lastlogin);
    const currentTime = new Date();
    const timeElapsed =
      (currentTime.getTime() - lastLogin.getTime()) / (1000 * 60); // Convert ms to minutes

    if (timeElapsed > ACCESS_TOKEN_EXPIRE_MINUTES) {
      res
        .status(STATUS_CODES.BAD_REQUEST)
        .json(errorJson('User logged out!', 0));
      return;
    }

    const timeLeft = ACCESS_TOKEN_EXPIRE_MINUTES - Math.floor(timeElapsed);

    res.status(STATUS_CODES.SELECT_SUCCESS).json({
      success: true,
      message: 'User logged in!',
      time_left: timeLeft,
    });
  } catch (error) {
    res.send(STATUS_CODES.UPDATE_FAILURE).json(errorJson('Server Error', null));
  }
}
