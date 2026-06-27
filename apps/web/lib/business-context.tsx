"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readApi, selectedBusinessKey, setSelectedBusinessId } from "./client-data";

type BusinessSummary = {
  id: string;
  business_id?: string;
  name: string;
  slug?: string | null;
  status?: string | null;
  role?: string | null;
};

type MeResponse = {
  user?: { id: string; email?: string | null };
  platform_role?: string | null;
  businesses?: BusinessSummary[];
  platform_businesses?: BusinessSummary[];
  selected_business?: string | null;
  selected_business_role?: string | null;
};

type BusinessContextValue = {
  status: "loading" | "ready" | "auth" | "error";
  message: string;
  email: string;
  platformRole: string | null;
  selectedBusinessId: string;
  selectedBusiness: BusinessSummary | null;
  selectedRole: string | null;
  businesses: BusinessSummary[];
  isSuperAdmin: boolean;
  selectBusiness: (businessId: string) => void;
  refresh: () => Promise<void>;
};

const BusinessContext = createContext<BusinessContextValue | null>(null);

function normalizeBusiness(item: BusinessSummary): BusinessSummary {
  return {
    ...item,
    id: item.id ?? item.business_id ?? "",
    role: item.role ?? null
  };
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BusinessContextValue["status"]>("loading");
  const [message, setMessage] = useState("Loading business context.");
  const [email, setEmail] = useState("");
  const [platformRole, setPlatformRole] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessIdState] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessSummary[]>([]);

  const load = useCallback(async () => {
    setStatus("loading");
    const result = await readApi<MeResponse>("/api/me");
    if (!result.ok) {
      setStatus(result.status === 401 ? "auth" : "error");
      setMessage(result.message);
      setEmail("");
      setBusinesses([]);
      setSelectedBusinessIdState("");
      setSelectedRole(null);
      setPlatformRole(null);
      return;
    }

    const memberBusinesses = (result.data.businesses ?? []).map(normalizeBusiness);
    const platformBusinesses = (result.data.platform_businesses ?? []).map(normalizeBusiness);
    const merged = [...memberBusinesses];
    for (const business of platformBusinesses) {
      if (!merged.some((item) => item.id === business.id)) merged.push(business);
    }

    const stored = typeof window === "undefined" ? "" : window.localStorage.getItem(selectedBusinessKey) ?? "";
    const apiSelected = result.data.selected_business ?? "";
    const selected = (stored && merged.some((item) => item.id === stored) ? stored : "") || apiSelected || merged[0]?.id || "";
    if (selected) setSelectedBusinessId(selected);

    const selectedBusiness = merged.find((item) => item.id === selected) ?? null;
    setEmail(result.data.user?.email ?? "");
    setPlatformRole(result.data.platform_role ?? null);
    setBusinesses(merged);
    setSelectedBusinessIdState(selected);
    setSelectedRole(selectedBusiness?.role ?? result.data.selected_business_role ?? null);
    setStatus("ready");
    setMessage(merged.length ? "" : "No business context is available for this account.");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedBusiness = useMemo(() => businesses.find((item) => item.id === selectedBusinessId) ?? null, [businesses, selectedBusinessId]);

  const value = useMemo<BusinessContextValue>(() => ({
    status,
    message,
    email,
    platformRole,
    selectedBusinessId,
    selectedBusiness,
    selectedRole,
    businesses,
    isSuperAdmin: platformRole === "super_admin",
    selectBusiness: (businessId: string) => {
      setSelectedBusinessId(businessId);
      setSelectedBusinessIdState(businessId);
      const next = businesses.find((item) => item.id === businessId);
      setSelectedRole(next?.role ?? (platformRole === "super_admin" ? null : selectedRole));
    },
    refresh: load
  }), [businesses, email, load, message, platformRole, selectedBusiness, selectedBusinessId, selectedRole, status]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusinessContext() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error("useBusinessContext must be used inside BusinessProvider");
  return context;
}

export function formatRole(role?: string | null) {
  if (!role) return "No role";
  return role.split("_").map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`).join(" ");
}
