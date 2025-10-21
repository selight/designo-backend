"use strict";
// Example client code for connecting to the Designo backend
// This shows how to integrate with the React frontend
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.broadcastCursorMove = exports.sendChatMessage = exports.broadcastAnnotationChange = exports.broadcastObjectChange = exports.broadcastCameraMove = exports.joinProject = void 0;
const socket_io_client_1 = require("socket.io-client");
// Socket.IO client setup
const socket = (0, socket_io_client_1.io)('http://localhost:3001', {
    transports: ['websocket', 'polling']
});
// Join a project room
const joinProject = (projectId, userName) => {
    socket.emit('join-project', { projectId, userName });
};
exports.joinProject = joinProject;
// Listen for room events
socket.on('user-joined', (data) => {
    console.log('User joined:', data);
});
socket.on('user-left', (data) => {
    console.log('User left:', data);
});
socket.on('room-users', (users) => {
    console.log('Current room users:', users);
});
// Camera movement
const broadcastCameraMove = (position, target) => {
    socket.emit('camera-move', { position, target });
};
exports.broadcastCameraMove = broadcastCameraMove;
socket.on('camera-moved', (data) => {
    console.log('Camera moved by:', data.userName, data.position, data.target);
});
// Object changes
const broadcastObjectChange = (action, object, objectId) => {
    socket.emit('object-change', { action, object, objectId });
};
exports.broadcastObjectChange = broadcastObjectChange;
socket.on('object-changed', (data) => {
    console.log('Object changed by:', data.userName, data.action);
});
// Annotation changes
const broadcastAnnotationChange = (action, annotation, annotationId) => {
    socket.emit('annotation-change', { action, annotation, annotationId });
};
exports.broadcastAnnotationChange = broadcastAnnotationChange;
socket.on('annotation-changed', (data) => {
    console.log('Annotation changed by:', data.userName, data.action);
});
// Chat messages
const sendChatMessage = (message) => {
    socket.emit('chat-message', { message });
};
exports.sendChatMessage = sendChatMessage;
socket.on('chat-message', (data) => {
    console.log('Chat message from:', data.userName, data.message);
});
// Cursor tracking
const broadcastCursorMove = (x, y) => {
    socket.emit('cursor-move', { x, y });
};
exports.broadcastCursorMove = broadcastCursorMove;
socket.on('cursor-moved', (data) => {
    console.log('Cursor moved by:', data.userName, data.x, data.y);
});
// Connection events
socket.on('connect', () => {
    console.log('Connected to server');
});
socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
socket.on('error', (error) => {
    console.error('Socket error:', error);
});
// REST API examples (using fetch)
exports.api = {
    // Get all projects
    getProjects: async () => {
        const response = await fetch('http://localhost:3001/api/projects');
        return response.json();
    },
    // Get specific project
    getProject: async (projectId) => {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`);
        return response.json();
    },
    // Create new project
    createProject: async (title, ownerId) => {
        const response = await fetch('http://localhost:3001/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, ownerId })
        });
        return response.json();
    },
    // Update project (autosave)
    updateProject: async (projectId, data) => {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },
    // Delete project
    deleteProject: async (projectId) => {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
            method: 'DELETE'
        });
        return response.json();
    },
    // Add annotation
    addAnnotation: async (projectId, annotation) => {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}/annotations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(annotation)
        });
        return response.json();
    },
    // Delete annotation
    deleteAnnotation: async (projectId, annotationId) => {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}/annotations/${annotationId}`, {
            method: 'DELETE'
        });
        return response.json();
    }
};
exports.default = socket;
//# sourceMappingURL=client-example.js.map