/**
 * Interface representing the structure of a JWT token payload.
 * @property username - The username of the authenticated user.
 * @property email - The email address of the authenticated user.
 */
export interface TokenPayload {
    username: string;
    email: string;
}