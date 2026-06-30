"use client";

import { useEffect, useRef, useState } from "react";
import { postJSON } from "@/hooks/use-api";
import { toast } from "sonner";
import type { CustomerLoginResponse } from "@/lib/types";
import { useMarketplace } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type GoogleCredentialResponse = {
  credential: string;
  select_by?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (resp: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "standard";
              width?: number;
              locale?: string;
            },
          ) => void;
        };
      };
    };
  }
}

/**
 * Renders the official Google Identity Services button. Falls back to a
 * disabled placeholder button when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set
 * (e.g. in local dev) so the surrounding UI remains functional.
 *
 * On successful sign-in, the credential is POSTed to /api/auth/customer/google
 * which validates the token and sets the bc_customer session cookie.
 */
export function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const setCustomerUser = useMarketplace((s) => s.setCustomerUser);
  const openCustomerDashboard = useMarketplace((s) => s.openCustomerDashboard);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function render() {
      if (!window.google?.accounts?.id) return;
      if (!containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp: GoogleCredentialResponse) => {
          setBusy(true);
          const res = await postJSON<CustomerLoginResponse>("/api/auth/customer/google", {
            credential: resp.credential,
          });
          setBusy(false);
          if (res.ok && res.data) {
            setCustomerUser(res.data.customer);
            toast.success(`Welcome, ${res.data.customer.name}!`);
            openCustomerDashboard("overview");
          } else {
            toast.error(res.error ?? "Google sign-in failed. Please try again.");
          }
        },
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: 360,
      });
      setLoaded(true);
    }

    if (window.google?.accounts?.id) {
      render();
      return;
    }

    let existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`,
    );
    if (!existing) {
      existing = document.createElement("script");
      existing.src = GOOGLE_SCRIPT_SRC;
      existing.async = true;
      existing.defer = true;
      document.head.appendChild(existing);
    }
    const handleLoad = () => render();
    existing.addEventListener("load", handleLoad);
    return () => existing?.removeEventListener("load", handleLoad);
  }, [setCustomerUser, openCustomerDashboard]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled
        title="Google sign-in is not configured in this environment"
      >
        <GoogleGIcon className="mr-2 h-4 w-4" />
        Continue with Google (unavailable)
      </Button>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div ref={containerRef} className="min-h-[40px] w-full max-w-[360px]" />
      {!loaded && !busy && (
        <span className="ml-3 inline-flex items-center text-xs text-muted-foreground">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading…
        </span>
      )}
      {busy && (
        <span className="ml-3 inline-flex items-center text-xs text-muted-foreground">
          <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Signing in…
        </span>
      )}
    </div>
  );
}

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
