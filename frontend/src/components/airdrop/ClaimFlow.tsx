import { CheckCircle2, FileKey2, Gift, ScanSearch } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Scan Eligibility",
    description: "Find private Eligibility records owned by the connected user.",
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
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <CardTitle>Claim Flow</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-emerald-400" />
                <span className="font-mono text-xs text-zinc-500">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {step.description}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
