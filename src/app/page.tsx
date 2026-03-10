"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../lib/auth-client";
import { AuthCard } from "../components/AuthCard";

export default function Home() {
  const router = useRouter();
  const sessionState = authClient.useSession();

  useEffect(() => {
    if (sessionState.data) {
      router.push("/dashboard");
    }
  }, [sessionState.data, router]);

  if (sessionState.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-subtitle">Loading...</div>
      </div>
    );
  }

  if (sessionState.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-subtitle">Redirecting to dashboard...</div>
      </div>
    );
  }

  return <AuthCard />;
}
