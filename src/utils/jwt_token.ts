import jwt from "jsonwebtoken";
import { ALGORITHM, SECRET_KEY } from "./consts";
import { TokenPayload } from "./jwt_payload";

/**
 * Generates an access token with expiration.
 * @param data - TokenPayload data.
 * @param expiresIn - Expiry time (default: 30 minutes).
 * @returns JWT token as a string.
 */
export const createAccessToken = (data: TokenPayload, expiresIn: string | number = "30m"): string => {
  return jwt.sign(data, SECRET_KEY, {
    algorithm: ALGORITHM as jwt.Algorithm,
    expiresIn: expiresIn as any,
  });
};

/**
 * Verifies a JWT token and returns the decoded payload.
 * @param token - JWT token string.
 * @throws Error if verification fails.
 * @returns Decoded token payload.
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, SECRET_KEY, {
      algorithms: [ALGORITHM as jwt.Algorithm],
    }) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
};