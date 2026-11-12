"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthStatus = "checking" | "authorized" | "error";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!active) return;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          setStatus("error");
          return;
        }

        setStatus("authorized");
      } catch {
        if (active) setStatus("error");
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [router, retry]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <p className="text-sm text-slate-500">
          Memeriksa autentikasi...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f9fc]">
        <p className="text-sm text-slate-600">
          Gagal memeriksa sesi login.
        </p>
        <button
          onClick={() => setRetry((value) => value + 1)}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (status !== "authorized") {
    return null;
  }

  return <>{children}</>;
}
