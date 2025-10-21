"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketHandlers = void 0;
const userService_1 = require("../services/userService");
const socketService_1 = require("../services/socketService");
const setupSocketHandlers = (io) => {
    const socketService = new socketService_1.SocketService(io);
    io.on('connection', async (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);
        // Handle joining a project room
        socket.on('join-project', async (data) => {
            try {
                const { projectId, userName } = data;
                // Create or get user using service
                const user = userName
                    ? await userService_1.userService.createOrGetUser(userName)
                    : await userService_1.userService.createAnonymousUser();
                socket.userId = user._id.toString();
                socket.userName = user.name;
                socket.userColor = user.color;
                socket.projectId = projectId;
                // Join the project room
                socket.join(projectId);
                // Create socket user object
                const socketUser = {
                    userId: user._id.toString(),
                    userName: user.name,
                    userColor: user.color,
                    socketId: socket.id
                };
                // Add user to room using service
                socketService.addUserToRoom(projectId, socketUser);
                // Send current room users to the new user
                const roomUsers = socketService.getRoomUsers(projectId);
                socket.emit('room-users', roomUsers);
                console.log(`👤 ${user.name} joined project ${projectId}`);
            }
            catch (error) {
                console.error('Error joining project:', error);
                socket.emit('error', { message: 'Failed to join project' });
            }
        });
        // Handle camera movement
        socket.on('camera-move', async (data) => {
            if (socket.projectId && socket.userId) {
                const socketUser = {
                    userId: socket.userId,
                    userName: socket.userName,
                    userColor: socket.userColor,
                    socketId: socket.id
                };
                await socketService.handleCameraMove(socket.projectId, socketUser, data);
            }
        });
        // Handle object changes (add, update, delete)
        socket.on('object-change', async (data) => {
            if (socket.projectId && socket.userId) {
                const socketUser = {
                    userId: socket.userId,
                    userName: socket.userName,
                    userColor: socket.userColor,
                    socketId: socket.id
                };
                await socketService.handleObjectChange(socket.projectId, socketUser, data);
            }
        });
        // Handle annotation changes
        socket.on('annotation-change', async (data) => {
            if (socket.projectId && socket.userId) {
                const socketUser = {
                    userId: socket.userId,
                    userName: socket.userName,
                    userColor: socket.userColor,
                    socketId: socket.id
                };
                await socketService.handleAnnotationChange(socket.projectId, socketUser, data);
            }
        });
        // Handle cursor position for real-time cursor tracking
        socket.on('cursor-move', (data) => {
            if (socket.projectId && socket.userId) {
                const socketUser = {
                    userId: socket.userId,
                    userName: socket.userName,
                    userColor: socket.userColor,
                    socketId: socket.id
                };
                socketService.broadcastCursorMove(socket.projectId, socketUser, data);
            }
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            if (socket.projectId) {
                const removedUser = socketService.removeUserFromRoom(socket.projectId, socket.id);
                if (removedUser) {
                    console.log(`👋 ${removedUser.userName} left project ${socket.projectId}`);
                }
            }
            console.log(`🔌 User disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
//# sourceMappingURL=socketHandlers.js.map