import { Server as SocketIOServer } from 'socket.io';
export interface SocketUser {
    userId: string;
    userName: string;
    userColor: string;
    socketId: string;
}
export interface CameraMoveData {
    position: [number, number, number];
    target: [number, number, number];
}
export interface ObjectChangeData {
    action: 'add' | 'update' | 'delete';
    object?: any;
    objectId?: string;
}
export interface AnnotationChangeData {
    action: 'add' | 'update' | 'delete';
    annotation?: any;
    annotationId?: string;
}
export interface CursorMoveData {
    x: number;
    y: number;
}
export declare class SocketService {
    private io;
    private roomUsers;
    constructor(io: SocketIOServer);
    /**
     * Add user to a project room
     */
    addUserToRoom(projectId: string, user: SocketUser): void;
    /**
     * Remove user from a project room
     */
    removeUserFromRoom(projectId: string, socketId: string): SocketUser | null;
    /**
     * Get all users in a project room
     */
    getRoomUsers(projectId: string): SocketUser[];
    /**
     * Broadcast camera movement to room
     */
    broadcastCameraMove(projectId: string, user: SocketUser, data: CameraMoveData): void;
    /**
     * Broadcast object change to room
     */
    broadcastObjectChange(projectId: string, user: SocketUser, data: ObjectChangeData): void;
    /**
     * Broadcast annotation change to room
     */
    broadcastAnnotationChange(projectId: string, user: SocketUser, data: AnnotationChangeData): void;
    /**
     * Broadcast cursor movement to room
     */
    broadcastCursorMove(projectId: string, user: SocketUser, data: CursorMoveData): void;
    /**
     * Handle object change with database persistence
     */
    handleObjectChange(projectId: string, user: SocketUser, data: ObjectChangeData): Promise<void>;
    /**
     * Handle annotation change with database persistence
     * Annotations are now handled as part of the objects array
     */
    handleAnnotationChange(projectId: string, user: SocketUser, data: AnnotationChangeData): Promise<void>;
    /**
     * Handle camera movement
     */
    handleCameraMove(projectId: string, user: SocketUser, data: CameraMoveData): Promise<void>;
    /**
     * Get room statistics
     */
    getRoomStats(projectId: string): {
        userCount: number;
        users: SocketUser[];
    };
    /**
     * Get all active rooms
     */
    getAllActiveRooms(): string[];
    /**
     * Get total connected users across all rooms
     */
    getTotalConnectedUsers(): number;
}
//# sourceMappingURL=socketService.d.ts.map