"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dockerRunner_1 = require("../services/dockerRunner");
const types_1 = require("../types");
const router = (0, express_1.Router)();
const SUPPORTED_LANGUAGES = Object.keys(types_1.LANGUAGE_CONFIGS);
router.post('/run', async (req, res) => {
    const { code, language, input } = req.body;
    // Validate request
    if (!code || typeof code !== 'string') {
        return res.status(400).json({
            success: false,
            output: '',
            error: 'Code is required and must be a string',
            executionTime: 0,
        });
    }
    if (!language || !SUPPORTED_LANGUAGES.includes(language)) {
        return res.status(400).json({
            success: false,
            output: '',
            error: `Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`,
            executionTime: 0,
        });
    }
    // Check code length limit (100KB)
    if (code.length > 100 * 1024) {
        return res.status(400).json({
            success: false,
            output: '',
            error: 'Code exceeds maximum length of 100KB',
            executionTime: 0,
        });
    }
    try {
        const result = await (0, dockerRunner_1.executeInDocker)(code, language, input);
        res.json(result);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Execution failed';
        res.status(500).json({
            success: false,
            output: '',
            error: errorMessage,
            executionTime: 0,
        });
    }
});
router.get('/health', async (_req, res) => {
    const dockerHealthy = await (0, dockerRunner_1.checkDockerHealth)();
    res.json({
        status: dockerHealthy ? 'ok' : 'degraded',
        docker: dockerHealthy,
        timestamp: new Date().toISOString(),
        supportedLanguages: SUPPORTED_LANGUAGES,
    });
});
router.get('/languages', (_req, res) => {
    res.json({
        languages: SUPPORTED_LANGUAGES.map((lang) => ({
            id: lang,
            config: {
                timeout: types_1.LANGUAGE_CONFIGS[lang].timeout,
                image: types_1.LANGUAGE_CONFIGS[lang].image,
            },
        })),
    });
});
exports.default = router;
//# sourceMappingURL=execute.js.map