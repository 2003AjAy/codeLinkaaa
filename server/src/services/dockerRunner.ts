import Docker from 'dockerode';
import { v4 as uuidv4 } from 'uuid';
import { SupportedLanguage, ExecutionResult, LANGUAGE_CONFIGS } from '../types';

const docker = new Docker();

async function removeContainer(container: Docker.Container): Promise<void> {
  try {
    await container.remove({ force: true });
  } catch {
    // Ignore removal errors
  }
}

export async function executeInDocker(
  code: string,
  language: SupportedLanguage,
  input?: string
): Promise<ExecutionResult> {
  const config = LANGUAGE_CONFIGS[language];
  const startTime = Date.now();
  const containerId = `codelinka-${uuidv4().slice(0, 8)}`;
  let container: Docker.Container | null = null;

  try {
    // Pull image if not exists
    await ensureImage(config.image);

    // Prepare code - for Java, extract class name
    let fileName = config.fileName;
    const processedCode = code;

    if (language === 'java') {
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      if (classMatch) {
        fileName = `${classMatch[1]}.java`;
      }
    }

    // Build the command
    let cmd: string;
    if (config.compileCmd) {
      // For compiled languages, compile then run
      const compileCmd = language === 'java'
        ? `javac ${fileName}`
        : config.compileCmd;
      const runCmd = language === 'java'
        ? `java ${fileName.replace('.java', '')}`
        : config.runCmd;
      cmd = `${compileCmd} && ${runCmd}`;
    } else {
      cmd = config.runCmd;
    }

    // Create container
    container = await docker.createContainer({
      Image: config.image,
      name: containerId,
      Cmd: ['sh', '-c', `cat > ${fileName} << 'CODEEOF'\n${processedCode}\nCODEEOF\n${cmd}`],
      WorkingDir: '/app',
      NetworkDisabled: true,
      HostConfig: {
        Memory: 128 * 1024 * 1024, // 128MB
        MemorySwap: 128 * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000, // 50% CPU
        PidsLimit: 64,
      },
      AttachStdin: !!input,
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: !!input,
      StdinOnce: true,
      Tty: false,
    });

    // Start container
    await container.start();

    // If there's input, write it to stdin
    if (input) {
      const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: false,
        stderr: false,
      });
      stream.write(input);
      stream.end();
    }

    // Wait for container with timeout
    let timedOut = false;
    const timeoutId = setTimeout(async () => {
      timedOut = true;
      try {
        await container?.kill();
      } catch {
        // Container might already be stopped
      }
    }, config.timeout);

    const waitResult = await container.wait();
    clearTimeout(timeoutId);

    if (timedOut) {
      const executionTime = Date.now() - startTime;
      await removeContainer(container);
      return {
        success: false,
        output: '',
        error: 'Execution timed out (10s limit)',
        executionTime,
      };
    }

    // Get logs
    const logs = await container.logs({
      stdout: true,
      stderr: true,
    });

    const { stdout, stderr } = parseDockerLogs(logs);
    const executionTime = Date.now() - startTime;

    // Clean up container
    await removeContainer(container);

    return {
      success: waitResult.StatusCode === 0 && !stderr,
      output: stdout,
      error: stderr || undefined,
      executionTime,
    };
  } catch (err) {
    const executionTime = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    if (container) {
      await removeContainer(container);
    }

    return {
      success: false,
      output: '',
      error: errorMessage,
      executionTime,
    };
  }
}

async function ensureImage(imageName: string): Promise<void> {
  try {
    await docker.getImage(imageName).inspect();
  } catch {
    console.log(`Pulling image: ${imageName}`);
    await new Promise<void>((resolve, reject) => {
      docker.pull(imageName, (err: Error | null, stream: NodeJS.ReadableStream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }
}

function parseDockerLogs(buffer: Buffer): { stdout: string; stderr: string } {
  let stdout = '';
  let stderr = '';
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;

    const streamType = buffer[offset];
    const size = buffer.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + size > buffer.length) break;

    const content = buffer.slice(offset, offset + size).toString('utf8');
    offset += size;

    if (streamType === 1) {
      stdout += content;
    } else if (streamType === 2) {
      stderr += content;
    }
  }

  return { stdout, stderr };
}

export async function checkDockerHealth(): Promise<boolean> {
  try {
    await docker.ping();
    return true;
  } catch {
    return false;
  }
}
