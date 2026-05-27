import { CheckCircle2, FileKey2, Gift, ScanSearch } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MotionFadeUp,
  ProofStepMotion,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

const steps = [
  {
    title: "Scan Eligibility",
    description:
      "Find private Eligibility records owned by the connected user.",
    icon: ScanSearch,
  },
  {
    title: "Generate Proof",
    description: "Prove the user owns a valid eligibility record.",
    icon: FileKey2,
  },
  {
    title: "Claim Reward",
    description: "Consume Eligibility and mint a private Reward record.",
    icon: Gift,
  },
  {
    title: "Prevent Double Claim",
    description: "Update public claimed mapping and campaign statistics.",
    icon: CheckCircle2,
  },
];

export function ClaimFlow() {
  return (
    <MotionFadeUp>
      <Card className="border-zinc-800 bg-zinc-950 text-white">
        <CardHeader>
          <CardTitle>Claim Flow</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-4">
          <StaggerContainer className="grid gap-4 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <StaggerItem key={step.title}>
                  <ProofStepMotion index={index} active={index === 0}>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start">
                        <div className="flex items-center md:items-start">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/60 font-mono text-emerald-300">
                            {String(index + 1).padStart(2, "0")}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-emerald-400" />
                              <h3 className="font-semibold">{step.title}</h3>
                            </div>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ProofStepMotion>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </CardContent>
      </Card>
    </MotionFadeUp>
  );
}
