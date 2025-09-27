import { useEffect, useState } from "react";
import { useTranslations } from "@/shared/i18n/I18nProvider";

type Draft = {
  name?: string;
  legalName?: string;
  website?: string;
  size?: string;
  industry?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  description?: string;
  logoUrl?: string;
  status?: string;
};

const KEY = "company_profile_draft";

type FieldProps = {
  label: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
  type?: string;
};

function Field({ label, name, value, onChange, type = "text" }: FieldProps) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        className="w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring"
        name={name}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        type={type}
      />
    </label>
  );
}

export default function CompanyProfileEdit() {
  const t = useTranslations();
  const [draft, setDraft] = useState<Draft>({ status: "ACTIVE" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setDraft(JSON.parse(saved));
    } catch {
      // ignore malformed drafts
    }
  }, []);

  function save() {
    localStorage.setItem(KEY, JSON.stringify(draft));
    window.alert(t("companyProfile.saveSuccess"));
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">{t("companyProfile.title")}</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field
          label={t("companyProfile.form.name")}
          name="name"
          value={draft.name}
          onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
        />
        <Field
          label={t("companyProfile.form.legalName")}
          name="legalName"
          value={draft.legalName}
          onChange={(v) => setDraft((d) => ({ ...d, legalName: v }))}
        />
        <Field
          label={t("companyProfile.form.website")}
          name="website"
          value={draft.website}
          onChange={(v) => setDraft((d) => ({ ...d, website: v }))}
        />
        <Field
          label={t("companyProfile.form.size")}
          name="size"
          value={draft.size}
          onChange={(v) => setDraft((d) => ({ ...d, size: v }))}
        />
        <Field
          label={t("companyProfile.form.industry")}
          name="industry"
          value={draft.industry}
          onChange={(v) => setDraft((d) => ({ ...d, industry: v }))}
        />
        <Field
          label={t("companyProfile.form.city")}
          name="city"
          value={draft.city}
          onChange={(v) => setDraft((d) => ({ ...d, city: v }))}
        />
        <Field
          label={t("companyProfile.form.region")}
          name="region"
          value={draft.region}
          onChange={(v) => setDraft((d) => ({ ...d, region: v }))}
        />
        <Field
          label={t("companyProfile.form.country")}
          name="country"
          value={draft.countryCode}
          onChange={(v) => setDraft((d) => ({ ...d, countryCode: v }))}
        />
        <Field
          label={t("companyProfile.form.logoUrl")}
          name="logoUrl"
          value={draft.logoUrl}
          onChange={(v) => setDraft((d) => ({ ...d, logoUrl: v }))}
        />
        <Field
          label={t("companyProfile.form.status")}
          name="status"
          value={draft.status}
          onChange={(v) => setDraft((d) => ({ ...d, status: v }))}
        />
      </div>
      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium">{t("companyProfile.form.description")}</span>
        <textarea
          className="min-h-[120px] w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring"
          value={draft.description || ""}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        />
      </label>
      <button onClick={save} className="rounded-2xl bg-black px-4 py-2 text-white">
        {t("common.actions.saveDraft")}
      </button>
      <p className="mt-2 text-xs text-gray-500">{t("companyProfile.draftNotice")}</p>
    </div>
  );
}
