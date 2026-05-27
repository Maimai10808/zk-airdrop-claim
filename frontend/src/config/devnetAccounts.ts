import "server-only";

import type {
  PublicDevnetAccount,
  ServerDevnetAccount,
} from "@/types/devnetAccount";

/**
 * 这些账户只用于本地 devnet demo。
 *
 * 注意：
 * - 不能用于 mainnet/testnet/真实资产；
 * - privateKey 虽然写在仓库中，但只服务于本地演示；
 * - 这个文件通过 `server-only` 限制在服务端使用；
 * - 浏览器端永远不能拿到 privateKey。
 */
const DEVNET_ACCOUNTS: ServerDevnetAccount[] = [
  {
    id: "user-1",
    label: "User 1",
    address: "aleo18a3ugz8du4lshegzr6kdgyn0g56yeduyuvhe4554spjm2dh2wyyst82ywa",
    privateKey: "APrivateKey1zkp9PQNLAnnnmAetrsgUB8BVM3hPw7Ua4qTeiTba18o9RWJ",
    viewKey: "AViewKey1k7Utr3ik99sWJZKQ2Q8Hh19SSgqdmTpLahSEncrMeaR6",
  },
  {
    id: "user-2",
    label: "User 2",
    address: "aleo1ym34ds9sfp2qawnm79whxl06gr4glsnfekzw2g2q420u9ns75yrqgzc560",
    privateKey: "APrivateKey1zkpEg4quFWYZQrM8kyE3Z6N8dtuW6GhgxB4nFJZWUJ34Rvw",
    viewKey: "AViewKey1kHfy6TV8jxJf99xiMNRbrpauj3Fm4X65YJhhhtRkK65g",
  },
  {
    id: "user-3",
    label: "User 3",
    address: "aleo1c46twlnfs29u8ed677v6mcu3tgwxy679290xhqlfpg56gnf28ypsxu7udh",
    privateKey: "APrivateKey1zkpJUGQKzktZLwNsNBkw77BvnvECUZ4amG7uKw9UVyCLiEj",
    viewKey: "AViewKey1hQmwDAM5FMi2Uwp1HEAU3teYAnEmfsb4uTTmeigsWDM3",
  },
  {
    id: "user-4",
    label: "User 4",
    address: "aleo1g5669kagrmgdwe6x3rj3vl6jvm9d4panw4lqucvdfw9gq83kdvzsejmhf9",
    privateKey: "APrivateKey1zkpHRtaBJFvbonXA7Xb4coXT2m4eerXrNqGQtWs8gd5Ao68",
    viewKey: "AViewKey1jE8QWra7KDDGWMkYmuGNycQPUzFELWYdhi2UpxRjQDNP",
  },
  {
    id: "user-5",
    label: "User 5",
    address: "aleo1n26qmjzs05hkhgncqrx5vsumnd0dpqx5yhp0kwgupzygh74rsqgqw464um",
    privateKey: "APrivateKey1zkp3j7LAnxPUzQYnv4naErdvRavu1PsNNGA4KYppZfytbVp",
    viewKey: "AViewKey1r4WhFbfAKQxH2ZY1Eg5QQSBNrXUCVw4Rd848mjxdK5xB",
  },
  {
    id: "user-6",
    label: "User 6",
    address: "aleo1s3erdtdsuelhykfgds6ft64eynhag0e0vgsph6dmf7qvu6dpfyyqjraep5",
    privateKey: "APrivateKey1zkp2oxKcMXTg95vgM535JJpCbdmUeEVqwqzhZn7FRXD9NFj",
    viewKey: "AViewKey1heYzK4vdtHkZUUsb5hustxmjysP1MLtdkYwKJFSkrj61",
  },
  {
    id: "user-7",
    label: "User 7",
    address: "aleo1hcd7le4c20cd4s3sj2d7klnrplsuc5aq9h4a530xgl3fkj80yygsjusljp",
    privateKey: "APrivateKey1zkp8ueY4nXfXzVmznh8Xp7KD5CxDRcCssdadybruh977rbg",
    viewKey: "AViewKey1nPQLPvyag1CEWSxgS6qYHAVKsGQ4fkjzsmWXdFgVcVXn",
  },
  {
    id: "user-8",
    label: "User 8",
    address: "aleo1rkgu7sc2m75ye5s0ksezzelz37jmsmu0lwxxh60ka6ws5jmq25zsr28um6",
    privateKey: "APrivateKey1zkp3AXaBrChRVPgqeHEMphvhYG6A81PZjMsRrdHtsojvmKd",
    viewKey: "AViewKey1uUgg1CosM3vXFB972Bkwxxt5gDYnMpvpqdNLHqi2dvrd",
  },
  {
    id: "user-9",
    label: "User 9",
    address: "aleo1ju6f5p7c0vwn9rm0786s359xh7wf5mplutey5ml7wtzqvy0gjszqd2tduj",
    privateKey: "APrivateKey1zkpHc31NBRFkfZEBLzScQnJt8shM85hExVAm7kTPPg3nVv8",
    viewKey: "AViewKey1dMSAeyQzDjj9BrDRVuckFBzJs9gKPLMzTCJc9G5ghuWp",
  },
  {
    id: "user-10",
    label: "User 10",
    address: "aleo18dzz923ynh933htdc0mvptum7hp0exqvrygv52x36ck23rk8msxs4alca6",
    privateKey: "APrivateKey1zkp8EREYRkg2FfZHXVvtwABBphDowjdLYttFPNRRquL7vkx",
    viewKey: "AViewKey1geguSC2UJadKRrTiqzom3v5EkVKvNQa3CjhPNoGAWsGX",
  },
];

export function getPublicDevnetAccounts(): PublicDevnetAccount[] {
  return DEVNET_ACCOUNTS.map(({ id, label, address }) => ({
    id,
    label,
    address,
  }));
}

export function getDevnetAccountById(accountId: string): ServerDevnetAccount {
  const account = DEVNET_ACCOUNTS.find((item) => item.id === accountId);

  if (!account) {
    throw new Error(`Unknown devnet account: ${accountId}`);
  }

  return account;
}
