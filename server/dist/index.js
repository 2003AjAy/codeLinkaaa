"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const execute_1 = __importDefault(require("./routes/execute"));
const users_1 = __importDefault(require("./routes/users"));
const sessions_1 = __importDefault(require("./routes/sessions"));
const questions_1 = __importDefault(require("./routes/questions"));
const notes_1 = __importDefault(require("./routes/notes"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
// Middleware
app.use((0, cors_1.default)({
    origin: CLIENT_URL,
    credentials: true, // Allow cookies
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
// Session middleware (required for passport OAuth flow)
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET || 'codelinka_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 5 * 60 * 1000, // 5 minutes - just for OAuth flow
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api', execute_1.default);
app.use('/api/users', users_1.default);
app.use('/api/sessions', sessions_1.default);
app.use('/api/questions', questions_1.default);
app.use('/api/notes', notes_1.default);
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'CodeLinka Server',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'GET /api/auth/login?role=teacher|interviewer|user',
                callback: 'GET /api/auth/callback',
                me: 'GET /api/auth/me',
                logout: 'POST /api/auth/logout',
                status: 'GET /api/auth/status',
            },
            health: 'GET /api/health',
            execute: 'POST /api/run',
            languages: 'GET /api/languages',
            users: {
                list: 'GET /api/users',
                get: 'GET /api/users/:id',
                create: 'POST /api/users',
                update: 'PUT /api/users/:id',
                delete: 'DELETE /api/users/:id',
            },
            sessions: {
                list: 'GET /api/sessions',
                active: 'GET /api/sessions/active',
                get: 'GET /api/sessions/:id',
                create: 'POST /api/sessions',
                update: 'PUT /api/sessions/:id',
                join: 'POST /api/sessions/:id/join',
                leave: 'POST /api/sessions/:id/leave',
                end: 'POST /api/sessions/:id/end',
                delete: 'DELETE /api/sessions/:id',
            },
            questions: {
                bySession: 'GET /api/questions/session/:sessionId',
                get: 'GET /api/questions/:id',
                create: 'POST /api/questions',
                update: 'PUT /api/questions/:id',
                delete: 'DELETE /api/questions/:id',
            },
            notes: {
                bySession: 'GET /api/notes/session/:sessionId',
                byUserInSession: 'GET /api/notes/session/:sessionId/user/:userId',
                save: 'POST /api/notes',
                update: 'PUT /api/notes/:id',
                delete: 'DELETE /api/notes/:id',
            },
        },
    });
});
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        output: '',
        error: 'Internal server error',
        executionTime: 0,
    });
});
app.listen(PORT, () => {
    console.log(`CodeLinka server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  Auth:');
    console.log('    GET  /api/auth/login?role=  - Start OAuth login');
    console.log('    GET  /api/auth/me           - Get current user');
    console.log('    POST /api/auth/logout       - Logout');
    console.log('  Code Execution:');
    console.log('    GET  /api/health            - Check server status');
    console.log('    POST /api/run               - Execute code');
    console.log('  Sessions, Users, Questions, Notes...');
});
//# sourceMappingURL=index.js.map