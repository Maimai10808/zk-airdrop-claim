"use client";

import { useAirdropStore } from "@/stores/airdropStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RewardPanel() {
  const { rewards } = useAirdropStore();

  return (
    <Card className="border-zinc-800 bg-zinc-950 text-white">
      <CardHeader>
        <CardTitle>Reward Records</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400">Record</TableHead>
                <TableHead className="text-zinc-400">Campaign</TableHead>
                <TableHead className="text-zinc-400">Amount</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Tx ID</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rewards.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-zinc-500"
                  >
                    No reward records yet.
                  </TableCell>
                </TableRow>
              ) : (
                rewards.map((reward) => (
                  <TableRow
                    key={reward.id}
                    className="border-zinc-800 hover:bg-zinc-900"
                  >
                    <TableCell className="font-mono text-sm">
                      <div>{reward.id}</div>
                      {reward.isDevMock ? (
                        <Badge className="mt-2 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/10">
                          DEV MOCK reward
                        </Badge>
                      ) : null}
                      {reward.isDevnetRecord ? (
                        <Badge className="mt-2 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                          REAL DEVNET reward
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {reward.campaignId}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-emerald-300">
                      {reward.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reward.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[220px] break-all font-mono text-xs text-zinc-300">
                      {reward.txId ?? "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
