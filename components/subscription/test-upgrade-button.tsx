"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type TestUpgradeButtonProps = {
  tier?: "STARTER" | "PRO" | "ENTERPRISE";
  className?: string;
};

export function TestUpgradeButton({ tier = "PRO", className }: TestUpgradeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onUpgrade() {
    setLoading(true);

    const response = await fetch("/api/subscription/test-upgrade", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tier }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.success) {
      toast.error(payload?.error?.message ?? "Failed to activate test plan");
      setLoading(false);
      return;
    }

    toast.success(`${tier} plan activated in test mode`);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button onClick={onUpgrade} disabled={loading} className={className}>
      {loading ? "Activating..." : `Activate ${tier} (Test)`}
    </Button>
  );
}
