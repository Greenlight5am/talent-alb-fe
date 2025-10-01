import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/shared/i18n/I18nProvider";

type Draft = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  about?: string;
  phone?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  visibility?: "PUBLIC" | "PRIVATE";
};

const KEY = "candidate_profile_draft";

export default function CandidateProfileEdit() {
  const t = useTranslations();
  const [draft, setDraft] = useState<Draft>({ visibility: "PUBLIC" });
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
    window.alert(t("candidateProfile.saveSuccess"));
    navigate(-1);
  }

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
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{t("candidateProfile.title")}</h2>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label={t("candidateProfile.form.firstName")}
          name="firstName"
          value={draft.firstName}
          onChange={(v: string) => setDraft((d) => ({ ...d, firstName: v }))}
        />
        <Field
          label={t("candidateProfile.form.lastName")}
          name="lastName"
          value={draft.lastName}
          onChange={(v: string) => setDraft((d) => ({ ...d, lastName: v }))}
        />
        <Field
          label={t("candidateProfile.form.headline")}
          name="headline"
          value={draft.headline}
          onChange={(v: string) => setDraft((d) => ({ ...d, headline: v }))}
        />
        <Field
          label={t("candidateProfile.form.phone")}
          name="phone"
          value={draft.phone}
          onChange={(v: string) => setDraft((d) => ({ ...d, phone: v }))}
        />
        <Field
          label={t("candidateProfile.form.city")}
          name="city"
          value={draft.city}
          onChange={(v: string) => setDraft((d) => ({ ...d, city: v }))}
        />
        <Field
          label={t("candidateProfile.form.region")}
          name="region"
          value={draft.region}
          onChange={(v: string) => setDraft((d) => ({ ...d, region: v }))}
        />
        <Field
          label={t("candidateProfile.form.country")}
          name="country"
          value={draft.countryCode}
          onChange={(v: string) => setDraft((d) => ({ ...d, countryCode: v }))}
        />
        </div>
        <label className="mt-4 mb-3 block">
          <span className="mb-1 block text-sm font-medium">{t("candidateProfile.form.about")}</span>
          <textarea
            className="min-h-[120px] w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring"
            value={draft.about || ""}
            onChange={(e) => setDraft((d) => ({ ...d, about: e.target.value }))}
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium">{t("candidateProfile.form.visibility")}</span>
          <select
            className="w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring"
            value={draft.visibility}
            onChange={(e) =>
              setDraft((d) => ({ ...d, visibility: e.target.value as Draft["visibility"] }))
            }
          >
            <option value="PUBLIC">{t("candidateProfile.form.visibilityPublic")}</option>
            <option value="PRIVATE">{t("candidateProfile.form.visibilityPrivate")}</option>
          </select>
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {t("common.actions.cancel")}
          </button>
          <button onClick={save} className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            {t("common.actions.saveDraft")}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">{t("candidateProfile.draftNotice")}</p>
      </div>
    </div>
  );
}
