import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
    navigate(-1);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          aria-label="Torna indietro"
        >
          ← {t("common.actions.cancel")}
        </button>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{t("companyProfile.title")}</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        <label className="mt-4 mb-4 block">
          <span className="mb-1 block text-sm font-medium">{t("companyProfile.form.description")}</span>
          <textarea
            className="min-h-[120px] w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring"
            value={draft.description || ""}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {t("common.actions.cancel")}
          </button>
          <button onClick={save} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {t("common.actions.saveDraft")}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t("companyProfile.draftNotice")}</p>
      </div>
    </div>
  );
}
