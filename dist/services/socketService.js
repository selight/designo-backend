"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const projectService_1 = require("./projectService");
class SocketService {
    constructor(io) {
        this.roomUsers = new Map();
        this.io = io;
    }
    /**
     * Add user to a project room
     */
    addUserToRoom(projectId, user) {
        if (!this.roomUsers.has(projectId)) {
            this.roomUsers.set(projectId, new Map());
        }
        const room = this.roomUsers.get(projectId);
        room.set(user.socketId, user);
        // Broadcast to other users in the room
        this.io.to(projectId).emit('user-joined', user);
    }
    /**
     * Remove user from a project room
     */
    removeUserFromRoom(projectId, socketId) {
        const room = this.roomUsers.get(projectId);
        if (!room)
            return null;
        const user = room.get(socketId);
        if (user) {
            room.delete(socketId);
            // If room is empty, remove it
            if (room.size === 0) {
                this.roomUsers.delete(projectId);
            }
            else {
                // Broadcast to remaining users
                this.io.to(projectId).emit('user-left', user);
            }
        }
        return user || null;
    }
    /**
     * Get all users in a project room
     */
    getRoomUsers(projectId) {
        const room = this.roomUsers.get(projectId);
        if (!room)
            return [];
        return Array.from(room.values());
    }
    /**
     * Broadcast camera movement to room
     */
    broadcastCameraMove(projectId, user, data) {
        this.io.to(projectId).emit('camera-moved', {
            ...user,
            ...data
        });
    }
    /**
     * Broadcast object change to room
     */
    broadcastObjectChange(projectId, user, data) {
        this.io.to(projectId).emit('object-changed', {
            ...user,
            ...data
        });
    }
    /**
     * Broadcast annotation change to room
     */
    broadcastAnnotationChange(projectId, user, data) {
        this.io.to(projectId).emit('annotation-changed', {
            ...user,
            ...data
        });
    }
    /**
     * Broadcast cursor movement to room
     */
    broadcastCursorMove(projectId, user, data) {
        this.io.to(projectId).emit('cursor-moved', {
            ...user,
            ...data
        });
    }
    /**
     * Handle object change with database persistence
     */
    async handleObjectChange(projectId, user, data) {
        try {
            // Broadcast to other users first
            this.broadcastObjectChange(projectId, user, data);
            // Update database
            if (data.action === 'add' && data.object) {
                await projectService_1.projectService.addObject(projectId, data.object);
            }
            else if (data.action === 'update' && data.object) {
                await projectService_1.projectService.updateObject(projectId, data.object.id, data.object);
            }
            else if (data.action === 'delete' && data.objectId) {
                await projectService_1.projectService.deleteObject(projectId, data.objectId);
            }
        }
        catch (error) {
            console.error('Error handling object change:', error);
            // Emit error to the specific user
            this.io.to(user.socketId).emit('error', {
                message: 'Failed to sync object change',
                type: 'object-change'
            });
        }
    }
    /**
     * Handle annotation change with database persistence
     * Annotations are now handled as part of the objects array
     */
    async handleAnnotationChange(projectId, user, data) {
        try {
            // Broadcast to other users first
            this.broadcastAnnotationChange(projectId, user, data);
            // Get current project to update objects
            const project = await projectService_1.projectService.getProjectById(projectId);
            if (!project) {
                throw new Error('Project not found');
            }
            let updatedObjects = [...project.objects];
            // Update objects array (annotations are now part of objects)
            if (data.action === 'add' && data.annotation) {
                updatedObjects.push(data.annotation);
            }
            else if (data.action === 'update' && data.annotation) {
                const index = updatedObjects.findIndex(obj => obj.id === data.annotation.id);
                if (index !== -1) {
                    updatedObjects[index] = data.annotation;
                }
            }
            else if (data.action === 'delete' && data.annotationId) {
                updatedObjects = updatedObjects.filter(obj => obj.id !== data.annotationId);
            }
            // Update project with new objects
            await projectService_1.projectService.updateProject(projectId, { objects: updatedObjects });
        }
        catch (error) {
            console.error('Error handling annotation change:', error);
            // Emit error to the specific user
            this.io.to(user.socketId).emit('error', {
                message: 'Failed to sync annotation change',
                type: 'annotation-change'
            });
        }
    }
    /**
     * Handle camera movement
     */
    async handleCameraMove(projectId, user, data) {
        try {
            // Broadcast to other users
            this.broadcastCameraMove(projectId, user, data);
            // Optionally save camera position to database
            await projectService_1.projectService.updateCamera(projectId, data);
        }
        catch (error) {
            console.error('Error handling camera move:', error);
        }
    }
    /**
     * Get room statistics
     */
    getRoomStats(projectId) {
        const users = this.getRoomUsers(projectId);
        return {
            userCount: users.length,
            users
        };
    }
    /**
     * Get all active rooms
     */
    getAllActiveRooms() {
        return Array.from(this.roomUsers.keys());
    }
    /**
     * Get total connected users across all rooms
     */
    getTotalConnectedUsers() {
        let total = 0;
        for (const room of this.roomUsers.values()) {
            total += room.size;
        }
        return total;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map