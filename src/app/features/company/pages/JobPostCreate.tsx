import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getSessionAccount } from "@/app/features/auth/useSession";
import { useTranslations } from "@/shared/i18n/I18nProvider";

type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "TEMPORARY";
type Seniority = "INTERN" | "JUNIOR" | "MID" | "SENIOR" | "LEAD";
type DistanceType = "ONSITE" | "HYBRID" | "REMOTE";

type CreateJobPostForm = {
  companyId: string;
  title: string;
  description: string;
  requirements: string;
  employmentType: EmploymentType | "";
  seniority: Seniority | "";
  distanceType: DistanceType | "";
  city: string;
  region: string;
  countryCode: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  salaryVisible: boolean;
};

type CreateJobPostResponse = {
  id: string;
  title: string;
  status?: string | null;
  publishedAt?: string | null;
};

const baseFieldClasses =
  "w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

const employmentTypeOptions: EmploymentType[] = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMPORARY",
];

const seniorityOptions: Seniority[] = ["INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"];

const distanceTypeOptions: DistanceType[] = ["ONSITE", "HYBRID", "REMOTE"];

function parseDecimal(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default function JobPostCreate() {
  const t = useTranslations();
  const account = useMemo(() => getSessionAccount(), []);
  const [form, setForm] = useState<CreateJobPostForm>({
    companyId: (account?.companyId as string | undefined) ||
      ((account?.company as { id?: string } | undefined)?.id ?? ""),
    title: "",
    description: "",
    requirements: "",
    employmentType: "",
    seniority: "",
    distanceType: "",
    city: "",
    region: "",
    countryCode: "",
    salaryMin: "",
    salaryMax: "",
    currency: "",
    salaryVisible: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateJobPostResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      if (!form.companyId.trim()) {
        throw new Error(t("companyJobs.validation.companyId"));
      }
      if (!form.title.trim()) {
        throw new Error(t("companyJobs.validation.title"));
      }
      if (!form.description.trim()) {
        throw new Error(t("companyJobs.validation.description"));
      }

      const payload = {
        companyId: form.companyId.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        employmentType: form.employmentType || undefined,
        seniority: form.seniority || undefined,
        distanceType: form.distanceType || undefined,
        city: form.city.trim() || undefined,
        region: form.region.trim() || undefined,
        countryCode: form.countryCode.trim() || undefined,
        salaryMin: parseDecimal(form.salaryMin),
        salaryMax: parseDecimal(form.salaryMax),
        currency: form.currency.trim() || undefined,
        salaryVisible: form.salaryVisible,
      };

      const response = await fetch("/api/job-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || t("companyJobs.feedback.errorMessage"));
      }

      const data = (await response.json()) as CreateJobPostResponse;
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || t("companyJobs.feedback.errorMessage"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm({
      companyId: (account?.companyId as string | undefined) ||
        ((account?.company as { id?: string } | undefined)?.id ?? ""),
      title: "",
      description: "",
      requirements: "",
      employmentType: "",
      seniority: "",
      distanceType: "",
      city: "",
      region: "",
      countryCode: "",
      salaryMin: "",
      salaryMax: "",
      currency: "",
      salaryVisible: true,
    });
    setError(null);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t("companyJobs.title")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("companyJobs.description")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.companyId")}
            <input
              className={baseFieldClasses}
              value={form.companyId}
              onChange={(e) => setForm((prev) => ({ ...prev, companyId: e.target.value }))}
              placeholder="00000000-0000-0000-0000-000000000000"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.title")}
            <input
              className={baseFieldClasses}
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.description")}
            <textarea
              className={`${baseFieldClasses} min-h-[120px]`}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.requirements")}
            <textarea
              className={`${baseFieldClasses} min-h-[100px]`}
              value={form.requirements}
              onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))}
              placeholder={t("companyJobs.placeholders.requirements")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.employmentType")}
            <select
              className={baseFieldClasses}
              value={form.employmentType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, employmentType: e.target.value as EmploymentType | "" }))
              }
            >
              <option value="">{t("companyJobs.placeholders.selectOption")}</option>
              {employmentTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.seniority")}
            <select
              className={baseFieldClasses}
              value={form.seniority}
              onChange={(e) => setForm((prev) => ({ ...prev, seniority: e.target.value as Seniority | "" }))}
            >
              <option value="">{t("companyJobs.placeholders.selectOption")}</option>
              {seniorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.distanceType")}
            <select
              className={baseFieldClasses}
              value={form.distanceType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, distanceType: e.target.value as DistanceType | "" }))
              }
            >
              <option value="">{t("companyJobs.placeholders.selectOption")}</option>
              {distanceTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.city")}
            <input
              className={baseFieldClasses}
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              placeholder={t("companyJobs.placeholders.optional")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.region")}
            <input
              className={baseFieldClasses}
              value={form.region}
              onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
              placeholder={t("companyJobs.placeholders.optional")}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.countryCode")}
            <input
              className={baseFieldClasses}
              value={form.countryCode}
              onChange={(e) => setForm((prev) => ({ ...prev, countryCode: e.target.value }))}
              placeholder="IT"
              maxLength={2}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.currency")}
            <input
              className={baseFieldClasses}
              value={form.currency}
              onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
              placeholder="EUR"
              maxLength={3}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.salaryMin")}
            <input
              className={baseFieldClasses}
              value={form.salaryMin}
              onChange={(e) => setForm((prev) => ({ ...prev, salaryMin: e.target.value }))}
              placeholder="30000"
              inputMode="decimal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            {t("companyJobs.form.salaryMax")}
            <input
              className={baseFieldClasses}
              value={form.salaryMax}
              onChange={(e) => setForm((prev) => ({ ...prev, salaryMax: e.target.value }))}
              placeholder="45000"
              inputMode="decimal"
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
            checked={form.salaryVisible}
            onChange={(e) => setForm((prev) => ({ ...prev, salaryVisible: e.target.checked }))}
          />
          {t("companyJobs.form.salaryVisible")}
        </label>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={resetForm}
            disabled={submitting}
          >
            {t("companyJobs.actions.reset")}
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? t("companyJobs.actions.submitting") : t("companyJobs.actions.submit")}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong className="font-semibold">{t("companyJobs.feedback.errorTitle")}: </strong>
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="font-semibold">{t("companyJobs.feedback.successTitle")}</div>
          <p>{t("companyJobs.feedback.successMessage", { id: result.id })}</p>
          {result.status && (
            <p>{t("companyJobs.feedback.status", { status: result.status })}</p>
          )}
          {result.publishedAt && (
            <p>{t("companyJobs.feedback.publishedAt", { date: result.publishedAt })}</p>
          )}
        </div>
      )}
    </div>
  );
}
