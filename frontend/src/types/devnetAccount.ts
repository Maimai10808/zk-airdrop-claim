/**
 * PublicDevnetAccount 可以安全返回给浏览器。
 * 它只包含本地 devnet demo 账户的公开信息，不包含 privateKey / viewKey。
 */
export type PublicDevnetAccount = {
  id: string;
  label: string;
  address: string;
};

/**
 * ServerDevnetAccount 只能在服务端使用。
 * privateKey 必须留在 server-only 配置和 API route 中，不能泄露到浏览器端。
 */
export type ServerDevnetAccount = PublicDevnetAccount & {
  privateKey: string;
  viewKey?: string;
};
