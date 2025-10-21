"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const projects_1 = __importDefault(require("./routes/projects"));
const users_1 = __importDefault(require("./routes/users"));
const socketHandlers_1 = require("./socket/socketHandlers");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// CORS configuration for React frontend
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '50mb' })); // Large limit for 3D geometry data
app.use(express_1.default.urlencoded({ extended: true }));
// Socket.IO setup
const io = new socket_io_1.Server(server, {
    cors: corsOptions,
    transports: ['websocket', 'polling']
});
// Setup socket handlers
(0, socketHandlers_1.setupSocketHandlers)(io);
// Routes
app.use('/api/projects', projects_1.default);
app.use('/api/users', users_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
const PORT = process.env.PORT || 3001;
// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, database_1.default)();
        // Start HTTP server
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Socket.IO server ready`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log(` Health check: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    server.close(() => {
        console.log(' Process terminated');
        process.exit(0);
    });
});
startServer();
//# sourceMappingURL=index.js.map