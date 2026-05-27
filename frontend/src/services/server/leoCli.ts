import "server-only";

import { execFile } from "node:child_process";

export type LeoCommandResult = {
  stdout: string;
  stderr: string;
};

export type LeoExecutionResult = LeoCommandResult & {
  txId: string | null;
};

const LEO_TIMEOUT_MS = 120_000;

export class LeoCliError extends Error {
  stdout: string;
  stderr: string;

  constructor(message: string, stdout: string, stderr: string) {
    super(message);
    this.name = "LeoCliError";
    this.stdout = stdout;
    this.stderr = stderr;
  }
}

export function isLeoCliError(error: unknown): error is LeoCliError {
  return error instanceof LeoCliError;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

function parseTransactionId(output: string) {
  return (
    output.match(/transaction\s+ID:\s*'([^']+)'/i)?.[1] ??
    output.match(/transaction\s+ID:\s*"([^"]+)"/i)?.[1] ??
    output.match(/transaction\s+ID:\s*([a-zA-Z0-9_]+)/i)?.[1] ??
    null
  );
}

function assertLeoAccepted(stdout: string, stderr: string) {
  const combinedOutput = `${stdout}\n${stderr}`;

  if (/Transaction rejected/i.test(combinedOutput)) {
    throw new LeoCliError("Leo transaction rejected.", stdout, stderr);
  }
}

export function runLeoCommand(args: string[]): Promise<LeoCommandResult> {
  const cwd = getRequiredEnv("ALEO_PROGRAM_PATH");

  return new Promise((resolve, reject) => {
    execFile(
      "leo",
      args,
      {
        cwd,
        timeout: LEO_TIMEOUT_MS,
        maxBuffer: 1024 * 1024 * 10,
      },
      (error, stdout, stderr) => {
        try {
          assertLeoAccepted(stdout, stderr);
        } catch (rejectedError) {
          reject(rejectedError);
          return;
        }

        if (error) {
          reject(
            new LeoCliError(
              [
                `Leo command failed while running: leo ${args[0] ?? ""} ${args[1] ?? ""}`,
                `Exit code: ${error.code ?? "unknown"}`,
              ]
                .filter(Boolean)
                .join("\n\n"),
              stdout,
              stderr,
            ),
          );
          return;
        }

        resolve({ stdout, stderr });
      },
    );
  });
}

export async function executeLeoFunction(
  functionName: string,
  inputs: string[],
  options?: {
    privateKey?: string;
  },
): Promise<LeoExecutionResult> {
  const network = process.env.ALEO_DEVNET_NETWORK ?? "testnet";
  const endpoint = process.env.ALEO_DEVNET_ENDPOINT ?? "http://localhost:3030";
  const privateKey = options?.privateKey ?? getRequiredEnv("ALEO_DEVNET_PRIVATE_KEY");

  const result = await runLeoCommand([
    "execute",
    functionName,
    ...inputs,
    "--network",
    network,
    "--endpoint",
    endpoint,
    "--devnet",
    "--private-key",
    privateKey,
    "--broadcast",
    "--yes",
  ]);

  return {
    ...result,
    txId: parseTransactionId(`${result.stdout}\n${result.stderr}`),
  };
}
