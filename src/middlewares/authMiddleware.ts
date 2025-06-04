import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt_token";
import { TokenPayload } from "../utils/jwt_payload";
import { errorJson } from "../utils/common_funcs";
import { AUTH_ROLES, STATUS_CODES } from "../utils/consts";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson("AuthHeader absent or Invalid Format", null));
    return;
  }

  // at this point we have the proper token
  const token = authHeader.split(" ")[1];

  try {
    const user: TokenPayload = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(STATUS_CODES.FORBIDDEN_REQUEST).json(errorJson("Forbidden: Invalid or expired token", error));
  }
};

export function authorizeRoles(allowedRoles: string[] = []) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(STATUS_CODES.UNAUTHORIZED).json(errorJson("Unauthorized", null));
      return;
    }

    // delete only accessible to super_admin
    if (req.method === 'DELETE') {
      if (req.user.role_name === 'super_admin') {
        return next();
      }
      res.status(STATUS_CODES.FORBIDDEN_REQUEST).json(errorJson("Forbidden only super_admin may delete", null));
      return;
    }

    // Full authority users(AUTH_ROLES) get access to everything
    if (AUTH_ROLES.includes(req.user.role_name) || allowedRoles.includes(req.user.role_name)) {
      return next();
    }

    res.status(STATUS_CODES.FORBIDDEN_REQUEST).json(errorJson("Forbidden: Access denied", null));
  };
}
