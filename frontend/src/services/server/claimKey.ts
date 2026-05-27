import "server-only";

import { createRequire } from "node:module";

type AleoWasm = {
  Address: {
    from_string(address: string): {
      toField(): {
        add(other: unknown): {
          toString(): string;
        };
      };
    };
  };
  U64: {
    fromString(value: string): {
      toField(): unknown;
    };
  };
};

const require = createRequire(import.meta.url);

function loadAleoWasm() {
  return require("@provablehq/wasm") as AleoWasm;
}

/**
 * 计算 claimed mapping 的 key。
 *
 * 必须与 Leo 合约 finalize 中的逻辑保持一致：
 * 1. cast self.signer into field
 * 2. cast campaign_id into field
 * 3. add 两个 field
 */
export function computeClaimKey(address: string, campaignId: string) {
  const { Address, U64 } = loadAleoWasm();
  const addressField = Address.from_string(address).toField();
  const campaignField = U64.fromString(campaignId).toField();

  return addressField.add(campaignField).toString();
}
