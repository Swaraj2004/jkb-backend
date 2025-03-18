import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt_token";
import { TokenPayload } from "../utils/jwt_payload";
import { errorJson } from "../utils/common_funcs";

interface AuthenticatedRequest extends Request{
    user? : TokenPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json(errorJson("AuthHeader absent or Invalid Format", null));
    }

    // at this point we have the proper token
    const token = authHeader.split(" ")[1];

    try {
        const user: TokenPayload = verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json(errorJson("Forbidden: Invalid or expired token", null));
    }
};