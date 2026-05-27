import { isDevnetApiError } from "@/services/devnetAirdropClient";

/**
 * 从本地 devnet API 错误中提取 stdout / stderr。
 *
 * 这样前端可以展示 Leo CLI 的详细失败原因，
 * 比如合约 assert 失败、重复 claim、campaign 不存在等。
 */
export function getDevnetErrorDetails(error: unknown) {
  if (!isDevnetApiError(error)) {
    return null;
  }

  return [
    error.stdout ? `stdout:\n${error.stdout}` : "",
    error.stderr ? `stderr:\n${error.stderr}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}
