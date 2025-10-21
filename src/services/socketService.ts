import { Server as SocketIOServer } from 'socket.io';
import { projectService } from './projectService';
import { userService } from './userService';

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

export class SocketService {
  private io: SocketIOServer;
  private roomUsers: Map<string, Map<string, SocketUser>> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  /**
   * Add user to a project room
   */
  addUserToRoom(projectId: string, user: SocketUser): void {
    if (!this.roomUsers.has(projectId)) {
      this.roomUsers.set(projectId, new Map());
    }
    
    const room = this.roomUsers.get(projectId)!;
    room.set(user.socketId, user);
    
    // Broadcast to other users in the room
    this.io.to(projectId).emit('user-joined', user);
  }

  /**
   * Remove user from a project room
   */
  removeUserFromRoom(projectId: string, socketId: string): SocketUser | null {
    const room = this.roomUsers.get(projectId);
    if (!room) return null;
    
    const user = room.get(socketId);
    if (user) {
      room.delete(socketId);
      
      // If room is empty, remove it
      if (room.size === 0) {
        this.roomUsers.delete(projectId);
      } else {
        // Broadcast to remaining users
        this.io.to(projectId).emit('user-left', user);
      }
    }
    
    return user || null;
  }

  /**
   * Get all users in a project room
   */
  getRoomUsers(projectId: string): SocketUser[] {
    const room = this.roomUsers.get(projectId);
    if (!room) return [];
    
    return Array.from(room.values());
  }

  /**
   * Broadcast camera movement to room
   */
  broadcastCameraMove(projectId: string, user: SocketUser, data: CameraMoveData): void {
    this.io.to(projectId).emit('camera-moved', {
      ...user,
      ...data
    });
  }

  /**
   * Broadcast object change to room
   */
  broadcastObjectChange(projectId: string, user: SocketUser, data: ObjectChangeData): void {
    this.io.to(projectId).emit('object-changed', {
      ...user,
      ...data
    });
  }

  /**
   * Broadcast annotation change to room
   */
  broadcastAnnotationChange(projectId: string, user: SocketUser, data: AnnotationChangeData): void {
    // Broadcast to all users in the room except the sender
    this.io.to(projectId).emit('annotation-changed', {
      ...user,
      ...data
    });
  }


  /**
   * Broadcast cursor movement to room
   */
  broadcastCursorMove(projectId: string, user: SocketUser, data: CursorMoveData): void {
    this.io.to(projectId).emit('cursor-moved', {
      ...user,
      ...data
    });
  }

  /**
   * Handle object change with database persistence
   */
  async handleObjectChange(projectId: string, user: SocketUser, data: ObjectChangeData): Promise<void> {
    try {
      let shouldBroadcast = false;
      
      // Update database first
      if (data.action === 'add' && data.object) {
        // Check if object already exists to prevent duplicates
        const project = await projectService.getProjectById(projectId);
        if (project) {
          const existingIndex = project.objects.findIndex(obj => obj.id === data.object.id);
          if (existingIndex === -1) {
            await projectService.addObject(projectId, data.object);
            shouldBroadcast = true;
          } else {
            console.warn(`Object with ID ${data.object.id} already exists, skipping add`);
            return; // Don't broadcast if object already exists
          }
        }
      } else if (data.action === 'update' && data.object) {
        const success = await projectService.updateObject(projectId, data.object.id, data.object);
        shouldBroadcast = success;
      } else if (data.action === 'delete' && data.objectId) {
        const success = await projectService.deleteObject(projectId, data.objectId);
        shouldBroadcast = success;
      }
      
      // Only broadcast if there was an actual change
      if (shouldBroadcast) {
        // Broadcast to other users (excluding sender)
        this.io.to(projectId).except(user.socketId).emit('object-changed', {
          ...user,
          ...data
        });
      }
    } catch (error) {
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
  async handleAnnotationChange(projectId: string, user: SocketUser, data: AnnotationChangeData): Promise<void> {
    try {
      // Get current project to update objects
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      
      let updatedObjects = [...project.objects];
      let shouldBroadcast = false;
      

      if (data.action === 'add' && data.annotation) {
        const existingIndex = updatedObjects.findIndex(obj => obj.id === data.annotation.id);
        if (existingIndex === -1) {
          updatedObjects.push(data.annotation);
          shouldBroadcast = true;
        } else {
          console.warn(`Annotation with ID ${data.annotation.id} already exists, skipping add`);
          return;
        }
      } else if (data.action === 'update' && data.annotation) {
        const index = updatedObjects.findIndex(obj => obj.id === data.annotation.id);
        if (index !== -1) {
          updatedObjects[index] = data.annotation;
          shouldBroadcast = true;
        }
      } else if (data.action === 'delete' && data.annotationId) {
        const initialLength = updatedObjects.length;
        updatedObjects = updatedObjects.filter(obj => obj.id !== data.annotationId);
        shouldBroadcast = initialLength !== updatedObjects.length;
      }
      
      // Update project with new objects
      await projectService.updateProject(projectId, { objects: updatedObjects });
      
      // Only broadcast if there was an actual change
      if (shouldBroadcast) {
        // Broadcast to other users (excluding sender)
        this.io.to(projectId).except(user.socketId).emit('annotation-changed', {
          ...user,
          ...data
        });
      }
    } catch (error) {
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
  async handleCameraMove(projectId: string, user: SocketUser, data: CameraMoveData): Promise<void> {
    try {
      // Broadcast to other users
      this.broadcastCameraMove(projectId, user, data);
      
      // Optionally save camera position to database
      await projectService.updateCamera(projectId, data);
    } catch (error) {
      console.error('Error handling camera move:', error);
    }
  }

  /**
   * Get room statistics
   */
  getRoomStats(projectId: string): { userCount: number; users: SocketUser[] } {
    const users = this.getRoomUsers(projectId);
    return {
      userCount: users.length,
      users
    };
  }

  /**
   * Get all active rooms
   */
  getAllActiveRooms(): string[] {
    return Array.from(this.roomUsers.keys());
  }

  /**
   * Get total connected users across all rooms
   */
  getTotalConnectedUsers(): number {
    let total = 0;
    for (const room of this.roomUsers.values()) {
      total += room.size;
    }
    return total;
  }
}
