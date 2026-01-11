import { Router, Request, Response } from 'express';
import { executeInDocker, checkDockerHealth } from '../services/dockerRunner';
import { executeWithPiston, checkPistonHealth } from '../services/pistonRunner';
import { ExecutionRequest, SupportedLanguage, LANGUAGE_CONFIGS } from '../types';

const router = Router();

const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_CONFIGS) as SupportedLanguage[];

// Cache Docker availability check
let dockerAvailable: boolean | null = null;
let lastDockerCheck = 0;
const DOCKER_CHECK_INTERVAL = 30000; // Check every 30 seconds

async function isDockerAvailable(): Promise<boolean> {
  const now = Date.now();
  if (dockerAvailable !== null && now - lastDockerCheck < DOCKER_CHECK_INTERVAL) {
    return dockerAvailable;
  }
  dockerAvailable = await checkDockerHealth();
  lastDockerCheck = now;
  return dockerAvailable;
}

router.post('/run', async (req: Request, res: Response) => {
  const { code, language, input } = req.body as ExecutionRequest;

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
    let result;

    // Try Docker first, fall back to Piston API if Docker is not available
    if (await isDockerAvailable()) {
      result = await executeInDocker(code, language, input);
    } else {
      console.log('Docker not available, using Piston API fallback');
      result = await executeWithPiston(code, language, input);
    }

    res.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Execution failed';
    res.status(500).json({
      success: false,
      output: '',
      error: errorMessage,
      executionTime: 0,
    });
  }
});

router.get('/health', async (_req: Request, res: Response) => {
  const dockerHealthy = await checkDockerHealth();
  const pistonHealthy = await checkPistonHealth();

  // Status is ok if either Docker or Piston is available
  const hasExecutor = dockerHealthy || pistonHealthy;

  res.json({
    status: hasExecutor ? 'ok' : 'degraded',
    docker: dockerHealthy,
    piston: pistonHealthy,
    executor: dockerHealthy ? 'docker' : pistonHealthy ? 'piston' : 'none',
    timestamp: new Date().toISOString(),
    supportedLanguages: SUPPORTED_LANGUAGES,
  });
});

router.get('/languages', (_req: Request, res: Response) => {
  res.json({
    languages: SUPPORTED_LANGUAGES.map((lang) => ({
      id: lang,
      config: {
        timeout: LANGUAGE_CONFIGS[lang].timeout,
        image: LANGUAGE_CONFIGS[lang].image,
      },
    })),
  });
});

export default router;
