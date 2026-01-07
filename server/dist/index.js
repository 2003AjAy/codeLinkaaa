"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const execute_1 = __importDefault(require("./routes/execute"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
// Routes
app.use('/api', execute_1.default);
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'CodeLinka Server',
        version: '1.0.0',
        endpoints: {
            health: 'GET /api/health',
            execute: 'POST /api/run',
            languages: 'GET /api/languages',
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
    console.log('  GET  /api/health    - Check server and Docker status');
    console.log('  POST /api/run       - Execute code');
    console.log('  GET  /api/languages - List supported languages');
});
//# sourceMappingURL=index.js.map