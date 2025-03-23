import { compare } from 'bcrypt';
import { format, toZonedTime } from 'date-fns-tz';
import { Request, Response } from 'express';
import { errorJson } from '../utils/common_funcs';
import { ACCESS_TOKEN_EXPIRE_MINUTES, TZ_INDIA } from '../utils/consts';
import { prismaClient } from '../utils/database';
import { TokenPayload } from '../utils/jwt_payload';
import { createAccessToken } from '../utils/jwt_token';

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const userRecord = await prismaClient.user.findUnique({
            where: { email: email }
        });

        if (!userRecord) {
            res.status(404).json(errorJson("User Record Not Found", null));
            return;
        }

        const passwordMatch = await compare(password, userRecord.password);
        if (!passwordMatch) {
            res.status(401).json(errorJson("Invalid Credentials", null));
            return;
        }

        const studentDetail = await prismaClient.studentDetail.findUnique({
            where: { user_id: userRecord.id }
        });

        // Fetch the first user role associated with the given user_id and include the related role details
        const userRole = await prismaClient.userRoles.findFirst({
            where: { user_id: userRecord.id },
            include: { role: true }, // Fetch associated role details in a single query
        });

        if (!userRole) {
            res.status(404).json(errorJson("User Record Not Found", null));
            return;
        }

        const tokenPayload: TokenPayload = {
            id: userRecord.id,
            username: userRecord.full_name ?? "user",
            role_name: userRole.role.name
        }
        const accessToken = createAccessToken(tokenPayload, ACCESS_TOKEN_EXPIRE_MINUTES);

        const now = toZonedTime(new Date(), TZ_INDIA);   // Convert to Indian timezone

        // // Update or create a login status record.
        // const existingLoginStatus = await prismaClient.userLoginStatus.findUnique({
        //     where: { user_id: userRecord.id }
        // });

        // if (existingLoginStatus) {
        //     await prismaClient.userLoginStatus.update({
        //         where: { user_id: userRecord.id },
        //         data: { last_login: now }
        //     });
        // } else {
        //     await prismaClient.userLoginStatus.create({
        //         data: { user_id: userRecord.id, last_login: now }
        //     });
        // }

        // Build the response payload.
        const result = {
            success: true,
            message: "Login Successful",
            username: userRecord.full_name,
            user_id: userRecord.id,
            role_id: userRole.role_id,
            user_detail_id: studentDetail ? studentDetail.id : "",
            role_name: userRole.role.name,
            expire_minutes: ACCESS_TOKEN_EXPIRE_MINUTES,
            current_timestamp: format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: TZ_INDIA }),
            access_token: accessToken,
            token_type: "bearer"
        };

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(errorJson("Failed to login user", error instanceof Error ? error.message : "Unknown error"));
    }
}

export async function checkLoginStatus(req: Request, res: Response, userId: string) {
    try {
        const userLoginDetail = await prismaClient.user.findFirst({
            where: { id: userId },
            select: { lastlogin: true }
        });

        if (!userLoginDetail || !userLoginDetail.lastlogin) {
            res.status(404).json(errorJson("User Record Not Found or lastLogin not found", null));
            return;
        }

        const lastLogin = new Date(userLoginDetail.lastlogin);
        const currentTime = new Date();
        const timeElapsed = (currentTime.getTime() - lastLogin.getTime()) / (1000 * 60); // Convert ms to minutes

        if (timeElapsed > ACCESS_TOKEN_EXPIRE_MINUTES) {
            res.json(errorJson("User logged out!", 0));
            return;
        }

        const timeLeft = ACCESS_TOKEN_EXPIRE_MINUTES - Math.floor(timeElapsed);

        res.json({
            success: true,
            message: "User logged in!",
            time_left: timeLeft
        });
    } catch (error) {
        res.send(500).json(errorJson('Server Error', error));
    }
}