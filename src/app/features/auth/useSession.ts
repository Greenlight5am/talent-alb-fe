import { useEffect, useState } from "react";

export type SessionAccount = {
  id: string;
  email: string;
  roles?: string[];
  [k: string]: unknown;
};

export function getSessionAccount(): SessionAccount | null {
  try {
    const raw = localStorage.getItem("account");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSessionAccount() {
  localStorage.removeItem("account");
}

export function useSession() {
  const [account, setAccount] = useState<SessionAccount | null>(getSessionAccount());
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "account") setAccount(getSessionAccount());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return { account, setAccount, logout: () => { clearSessionAccount(); setAccount(null); } };
}
