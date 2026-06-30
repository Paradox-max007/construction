"use client";

import { useEffect } from "react";
import { useMarketplace } from "@/lib/store";
import { useApi } from "@/hooks/use-api";
import type { MeResponse, CustomerMeResponse, AdminMeResponse } from "@/lib/types";

/**
 * On mount, checks all three session cookies (provider / customer / admin)
 * and populates the matching slice of state. Runs once at app start.
 */
export function useAuthInit() {
  const setAuthUser = useMarketplace((s) => s.setAuthUser);
  const setCustomerUser = useMarketplace((s) => s.setCustomerUser);
  const setAdminUser = useMarketplace((s) => s.setAdminUser);
  const setAuthLoading = useMarketplace((s) => s.setAuthLoading);

  const { data: pData, status: pStatus } = useApi<MeResponse>("/api/auth/me", []);
  const { data: cData, status: cStatus } = useApi<CustomerMeResponse>("/api/auth/customer/me", []);
  const { data: aData, status: aStatus } = useApi<AdminMeResponse>("/api/auth/admin/me", []);

  // Provider session
  useEffect(() => {
    if (pStatus === "loading") return;
    if (pData?.authenticated && pData.provider) {
      setAuthUser({
        slug: pData.provider.slug,
        companyName: pData.provider.companyName,
        email: pData.provider.email,
      });
    } else {
      setAuthUser(null);
    }
  }, [pData, pStatus, setAuthUser]);

  // Customer session
  useEffect(() => {
    if (cStatus === "loading") return;
    if (cData?.authenticated && cData.customer) {
      const c = cData.customer;
      setCustomerUser({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
        googleId: c.googleId ?? null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      });
    } else {
      setCustomerUser(null);
    }
  }, [cData, cStatus, setCustomerUser]);

  // Admin session
  useEffect(() => {
    if (aStatus === "loading") return;
    if (aData?.authenticated && aData.admin) {
      setAdminUser(aData.admin);
    } else {
      setAdminUser(null);
    }
  }, [aData, aStatus, setAdminUser]);

  // Loading flag — true while any of the three is still loading on first run.
  useEffect(() => {
    const loading = pStatus === "loading" || cStatus === "loading" || aStatus === "loading";
    setAuthLoading(loading);
  }, [pStatus, cStatus, aStatus, setAuthLoading]);
}
