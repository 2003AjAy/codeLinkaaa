"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeInDocker = executeInDocker;
exports.checkDockerHealth = checkDockerHealth;
const dockerode_1 = __importDefault(require("dockerode"));
const uuid_1 = require("uuid");
const types_1 = require("../types");
const docker = new dockerode_1.default();
async function removeContainer(container) {
    try {
        await container.remove({ force: true });
    }
    catch {
        // Ignore removal errors
    }
}
async function executeInDocker(code, language, input) {
    const config = types_1.LANGUAGE_CONFIGS[language];
    const startTime = Date.now();
    const containerId = `codelinka-${(0, uuid_1.v4)().slice(0, 8)}`;
    let container = null;
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
        let cmd;
        if (config.compileCmd) {
            // For compiled languages, compile then run
            const compileCmd = language === 'java'
                ? `javac ${fileName}`
                : config.compileCmd;
            const runCmd = language === 'java'
                ? `java ${fileName.replace('.java', '')}`
                : config.runCmd;
            cmd = `${compileCmd} && ${runCmd}`;
        }
        else {
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
            }
            catch {
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
    }
    catch (err) {
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
async function ensureImage(imageName) {
    try {
        await docker.getImage(imageName).inspect();
    }
    catch {
        console.log(`Pulling image: ${imageName}`);
        await new Promise((resolve, reject) => {
            docker.pull(imageName, (err, stream) => {
                if (err)
                    return reject(err);
                docker.modem.followProgress(stream, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        });
    }
}
function parseDockerLogs(buffer) {
    let stdout = '';
    let stderr = '';
    let offset = 0;
    while (offset < buffer.length) {
        if (offset + 8 > buffer.length)
            break;
        const streamType = buffer[offset];
        const size = buffer.readUInt32BE(offset + 4);
        offset += 8;
        if (offset + size > buffer.length)
            break;
        const content = buffer.slice(offset, offset + size).toString('utf8');
        offset += size;
        if (streamType === 1) {
            stdout += content;
        }
        else if (streamType === 2) {
            stderr += content;
        }
    }
    return { stdout, stderr };
}
async function checkDockerHealth() {
    try {
        await docker.ping();
        return true;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=dockerRunner.js.map