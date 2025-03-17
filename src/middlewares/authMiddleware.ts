import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt_token";
import { TokenPayload } from "../utils/jwt_payload";

const SECRET_KEY = process.env.SECRET_KEY || "secret_key";

// function is incomplete and not tested
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded: TokenPayload = verifyToken(token);
        // req.user = decoded.username;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    }
};