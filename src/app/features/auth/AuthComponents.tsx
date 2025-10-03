import React, { createContext, useContext, useState } from "react";
import { useTranslations } from "@/shared/i18n/I18nProvider";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ToastKind = "success" | "error" | "info";

type ToastMessage = {
  id: number;
  kind: ToastKind;
  title?: string;
  message: string;
  duration?: number;
};

const ToastContext = createContext<{ push: (toast: Omit<ToastMessage, "id">) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const push = (toast: Omit<ToastMessage, "id">) => {
    const id = Date.now() + Math.random();
    const entry: ToastMessage = { id, duration: 3000, ...toast };
    setToasts((prev) => [...prev, entry]);
    setTimeout(() => setToasts((prev) => prev.filter((item) => item.id !== id)), entry.duration);
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              "w-80 rounded-2xl border p-3 shadow-lg backdrop-blur bg-white/95",
              toast.kind === "success" && "border-green-200",
              toast.kind === "error" && "border-red-200",
              toast.kind === "info" && "border-gray-200"
            )}
          >
            <div className="flex items-start gap-2">
              <span
                className={cx(
                  "mt-1 inline-block h-2.5 w-2.5 rounded-full",
                  toast.kind === "success" && "bg-green-500",
                  toast.kind === "error" && "bg-red-500",
                  toast.kind === "info" && "bg-gray-500"
                )}
              />
              <div className="grow">
                {toast.title && <div className="text-sm font-medium">{toast.title}</div>}
                <div className="whitespace-pre-wrap text-sm text-gray-700">{toast.message}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-800">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm",
        "placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/80",
        props.className || ""
      )}
    />
  );
}

type FieldProps = { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, name, ...rest }: FieldProps) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...rest} />
    </div>
  );
}

type PasswordFieldProps = {
  label: string;
  showLabel: string;
  hideLabel: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

export function PasswordField({ label, showLabel, hideLabel, value, onChange, required }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <Label htmlFor="password">{label}</Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl border px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
        >
          {show ? hideLabel : showLabel}
        </button>
      </div>
    </div>
  );
}

type SubmitButtonProps = {
  loading: boolean;
  children: React.ReactNode;
  loadingLabel?: string;
};

export function SubmitButton({ loading, children, loadingLabel }: SubmitButtonProps) {
  const t = useTranslations();
  return (
    <button
      className={cx(
        "mt-2 w-full rounded-2xl bg-black p-3 text-white shadow transition",
        "disabled:cursor-not-allowed disabled:opacity-60 hover:bg-black/90"
      )}
      disabled={loading}
      type="submit"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {loadingLabel ?? t("auth.signup.processing")}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
