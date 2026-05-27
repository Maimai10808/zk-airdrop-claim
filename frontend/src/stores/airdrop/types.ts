import type { StateCreator } from "zustand";

import type { AirdropState } from "@/types/airdrop";

export type AirdropSet = Parameters<StateCreator<AirdropState>>[0];
export type AirdropGet = Parameters<StateCreator<AirdropState>>[1];
