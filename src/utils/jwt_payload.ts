/**
 * Interface representing the structure of a JWT token payload.
 * @property id - The id of the authenticated user.
 * @property username - The username of the authenticated user.
 * @property role_name - Role of the authenticated user.
 */
export interface TokenPayload {
    id: string;
    username: string;
    role_name: string;
}