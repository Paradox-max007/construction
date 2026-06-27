"use client";

import { useEffect } from "react";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import type { MeResponse } from "@/lib/types";

/**
 * On mount, checks if the user has a valid session cookie via /api/auth/me.
 * If authenticated, populates authUser in the store. This runs once at app start.
 */
export function useAuthInit() {
  const setAuthUser = useMarketplace((s) => s.setAuthUser);
  const setAuthLoading = useMarketplace((s) => s.setAuthLoading);
  const { data, status } = useApi<MeResponse>("/api/auth/me", []);

  useEffect(() => {
    if (status === "loading") {
      setAuthLoading(true);
    } else {
      setAuthLoading(false);
      if (data?.authenticated && data.provider) {
        setAuthUser({
          slug: data.provider.slug,
          companyName: data.provider.companyName,
          email: data.provider.email,
        });
      } else {
        setAuthUser(null);
      }
    }
  }, [data, status]);
}
