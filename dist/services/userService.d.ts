import { IUser } from '../models/User';
export interface CreateUserData {
    name: string;
    color?: string;
}
export declare class UserService {
    /**
     * Create a new user or get existing user by name
     */
    createOrGetUser(name: string): Promise<IUser>;
    /**
     * Create an anonymous user with random name
     */
    createAnonymousUser(): Promise<IUser>;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<IUser | null>;
    /**
     * Get user by name
     */
    getUserByName(name: string): Promise<IUser | null>;
    /**
     * Update user information
     */
    updateUser(userId: string, data: Partial<CreateUserData>): Promise<IUser | null>;
    /**
     * Delete user
     */
    deleteUser(userId: string): Promise<boolean>;
    /**
     * Get all users
     */
    getAllUsers(): Promise<IUser[]>;
    /**
     * Generate a random color for users
     */
    generateRandomColor(): string;
}
export declare const userService: UserService;
//# sourceMappingURL=userService.d.ts.map