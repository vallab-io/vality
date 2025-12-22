"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/common";
import { Button } from "@/components/ui/button";
import { useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "@/stores/auth.store";
import { getMyNewsletters } from "@/lib/api/newsletter";

export function ProfileHeader() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);
  const isAuthenticated = !!user;

  const handleDashboardClick = async () => {
    if (authLoading) return;
    
    if (user) {
      try {
        const newsletters = await getMyNewsletters();
        if (newsletters.length === 0) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to check newsletters:", error);
        router.push("/onboarding");
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Logo href="/home" className="text-xl font-bold text-foreground" />
        {isAuthenticated && (
          <Button 
            size="sm" 
            onClick={handleDashboardClick} 
            disabled={authLoading}
            className="font-medium"
          >
            Dashboard
          </Button>
        )}
      </div>
    </header>
  );
}

