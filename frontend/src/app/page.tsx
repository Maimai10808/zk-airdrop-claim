import { AirdropHero } from "@/components/airdrop/AirdropHero";
import { AirdropTasksPanel } from "@/components/airdrop/AirdropTasksPanel";
import { CampaignPanel } from "@/components/airdrop/CampaignPanel";
import { ClaimFlow } from "@/components/airdrop/ClaimFlow";
import { ClaimPanel } from "@/components/airdrop/ClaimPanel";
import { EligibilityPanel } from "@/components/airdrop/EligibilityPanel";
import { RewardPanel } from "@/components/airdrop/RewardPanel";
import { NetworkStatus } from "@/components/network/NetworkStatus";
import { DevnetAccountSwitcher } from "@/components/wallet/DevnetAccountSwitcher";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { ZkCircuitBackground } from "@/components/motion";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-black px-6 py-10">
      <ZkCircuitBackground />
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <AirdropHero />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <ClaimFlow />
            <AirdropTasksPanel />
            <EligibilityPanel />
            <ClaimPanel />
            <RewardPanel />
          </div>

          <div className="flex flex-col gap-6">
            <WalletPanel />
            <DevnetAccountSwitcher />
            <NetworkStatus />
            <CampaignPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
