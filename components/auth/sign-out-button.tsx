"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
};

export function SignOutButton({
  className,
  variant = "outline",
}: SignOutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    if (loading) {
      return;
    }

    setLoading(true);

    const { error } = await signOut();

    if (error) {
      toast.error(error.message ?? "Failed to sign out");
      setLoading(false);
      return;
    }

    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleSignOut}
      disabled={loading}
    >
      <LogOut className="size-4" />
      {loading ? "Signing out..." : "Log out"}
    </Button>
  );
}
