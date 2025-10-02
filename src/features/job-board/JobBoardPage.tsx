import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Link } from "react-router-dom";
import { LanguageSwitcher } from "@/shared/i18n/LanguageSwitcher";
import { useI18n, useTranslations, type TranslateFn } from "@/shared/i18n/I18nProvider";
import { localeConfig } from "@/shared/i18n/localeConfig";
import { JobApplication, useJobApplicationsStorage } from "@/features/job-board/useJobApplicationsStorage";

type JobPostDto = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements?: string | null;
  employmentType?: string | null;
  seniority?: string | null;
  distanceType?: string | null;
  city?: string | null;
  region?: string | null;
  countryCode?: string | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  currency?: string | null;
  salaryVisible?: boolean | null;
  status?: string | null;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

type FiltersState = {
  q: string;
  city: string;
  country: string;
};

type FeedbackMessage = { kind: "success" | "error"; message: string } | null;

type ApplicationFormState = {
  candidateName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  message: string;
};

const PAGE_SIZE = 6;
const DEFAULT_FILTERS: FiltersState = { q: "", city: "", country: "" };
type SortOption = "relevance" | "newest" | "salaryHigh" | "salaryLow";

const baseButtonClasses =
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500";
const primaryButtonClasses =
  `${baseButtonClasses} bg-slate-800 text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-700`;
const secondaryButtonClasses =
  `${baseButtonClasses} border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50`;
const ghostButtonClasses =
  `${baseButtonClasses} text-slate-600 hover:text-slate-900 hover:bg-slate-100`;

export default function JobBoardPage() {
  const t = useTranslations();
  const [formState, setFormState] = useState<FiltersState>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [jobsPage, setJobsPage] = useState<PageResponse<JobPostDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPostDto | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage>(null);
  const [workMode, setWorkMode] = useState<string | null>(null);
  const [seniority, setSeniority] = useState<string | null>(null);
  const [employmentType, setEmploymentType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");

  const [, setApplications] = useJobApplicationsStorage();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("size", PAGE_SIZE.toString());
        params.set("status", "PUBLISHED");
        if (activeFilters.q.trim()) params.set("q", activeFilters.q.trim());
        if (activeFilters.city.trim()) params.set("city", activeFilters.city.trim());
        if (activeFilters.country.trim()) params.set("country", activeFilters.country.trim());

        const res = await fetch(`/api/job-posts?${params.toString()}`, {
          signal: controller.signal,
          headers: { "Accept": "application/json" },
        });
        if (!res.ok) {
          throw new Error(t("jobBoard.feedback.loadError"));
        }
        const data = (await res.json()) as PageResponse<JobPostDto>;
        setJobsPage(data);
        if (page !== data.number) {
          setPage(data.number);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || t("jobBoard.feedback.loadError"));
        setJobsPage(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [page, activeFilters.q, activeFilters.city, activeFilters.country, t]);

  const jobs = jobsPage?.content ?? [];
  const totalPages = jobsPage?.totalPages ?? 0;
  const totalElements = jobsPage?.totalElements ?? 0;

  const optionsFromJobs = useMemo(() => {
    const modes = new Set<string>();
    const seniorities = new Set<string>();
    const contracts = new Set<string>();
    for (const j of jobs) {
      if (j.distanceType) modes.add(j.distanceType);
      if (j.seniority) seniorities.add(j.seniority);
      if (j.employmentType) contracts.add(j.employmentType);
    }
    return {
      modes: Array.from(modes),
      seniorities: Array.from(seniorities),
      contracts: Array.from(contracts),
    };
  }, [jobs]);

  const refinedJobs = useMemo(() => {
    let list = jobs.slice();
    if (workMode) list = list.filter((j) => j.distanceType === workMode);
    if (seniority) list = list.filter((j) => j.seniority === seniority);
    if (employmentType) list = list.filter((j) => j.employmentType === employmentType);
    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
    } else if (sortBy === "salaryHigh") {
      list.sort((a, b) => (Number(b.salaryMax ?? b.salaryMin ?? 0) as number) - (Number(a.salaryMax ?? a.salaryMin ?? 0) as number));
    } else if (sortBy === "salaryLow") {
      list.sort((a, b) => (Number(a.salaryMin ?? a.salaryMax ?? 0) as number) - (Number(b.salaryMin ?? b.salaryMax ?? 0) as number));
    }
    return list;
  }, [jobs, workMode, seniority, employmentType, sortBy]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filtersSummary = useMemo(() => {
    const parts: string[] = [];
    if (activeFilters.q.trim())
      parts.push(t("jobBoard.filters.summaryKeyword", { value: activeFilters.q.trim() }));
    if (activeFilters.city.trim())
      parts.push(t("jobBoard.filters.summaryCity", { value: activeFilters.city.trim() }));
    if (activeFilters.country.trim())
      parts.push(t("jobBoard.filters.summaryCountry", { value: activeFilters.country.trim() }));
    return parts.join(" - ");
  }, [activeFilters, t]);

  const handleSubmitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setActiveFilters({ ...formState });
  };

  const handleResetFilters = () => {
    setFormState(DEFAULT_FILTERS);
    setActiveFilters(DEFAULT_FILTERS);
    setPage(0);
  };

  const handleApply = (job: JobPostDto) => {
    setSelectedJob(job);
  };

  const handleApplicationSubmit = (form: ApplicationFormState) => {
    if (!selectedJob) return;
    const application: JobApplication = {
      id: generateId(),
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      candidateName: form.candidateName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      resumeUrl: form.resumeUrl.trim() || undefined,
      message: form.message.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setApplications((prev) => [application, ...prev]);
    setSelectedJob(null);
    setFeedback({
      kind: "success",
      message: t("jobBoard.feedback.applicationSuccess", { title: selectedJob.title }),
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      activeFilters.q.trim().length > 0 ||
      activeFilters.city.trim().length > 0 ||
      activeFilters.country.trim().length > 0
    );
  }, [activeFilters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-base font-semibold tracking-tight text-slate-900">
            {t("common.appName")}
          </Link>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:flex-none">
            <nav className="order-1 flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600 sm:order-none">
              <a href="#jobs" className={`${ghostButtonClasses} px-3 py-2`}>
                {t("jobBoard.nav.offers")}
              </a>
              <a href="#candidature" className={`${ghostButtonClasses} px-3 py-2`}>
                {t("jobBoard.nav.applications")}
              </a>
              <Link to="/auth/signup" className={`${secondaryButtonClasses} px-3 py-2`}>
                {t("common.actions.createProfile")}
              </Link>
              <Link to="/app" className={`${primaryButtonClasses} px-3 py-2`}>
                {t("common.actions.signIn")}
              </Link>
            </nav>
            <LanguageSwitcher
              hideLabel
              className="order-2 w-full sm:order-none sm:w-auto"
              selectClassName="mt-0 w-full rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-36"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="py-6 text-center sm:py-8">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
            {t("jobBoard.hero.eyebrow")}
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
            {t("jobBoard.hero.title")}
          </h1>
          <p className="mt-2 mx-auto max-w-xl text-sm leading-relaxed text-slate-600">
            {t("jobBoard.hero.description")}
          </p>
          {totalElements > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              {t("jobBoard.hero.positionsCount", { count: totalElements })}
            </p>
          )}
        </section>

        {feedback && (
          <div
            role="alert"
            aria-live="polite"
            className={`mb-8 rounded-xl border px-4 py-3 text-sm ${
              feedback.kind === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                : "border-rose-100 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <section id="jobs" className="grid gap-10 lg:grid-cols-[7fr_3fr]">
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:z-10">
              <form onSubmit={handleSubmitFilters} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Input
                    id="search"
                    name="search"
                    placeholder={t("common.placeholders.searchKeyword")}
                    value={formState.q}
                    onChange={(event) => setFormState((prev) => ({ ...prev, q: event.target.value }))}
                    isClearable
                  />
                </div>
                <div className="flex-1">
                  <Input
                    id="location"
                    name="location"
                    placeholder={t("common.placeholders.searchCity")}
                    value={[formState.city, formState.country].filter(Boolean).join(", ")}
                    onChange={(event) => {
                      const parsed = parseLocation(event.target.value);
                      setFormState((prev) => ({ ...prev, city: parsed.city, country: parsed.country }));
                    }}
                    list="location-suggestions"
                    isClearable
                  />
                  <datalist id="location-suggestions">
                    <option value="Tirana, AL" />
                    <option value="Durres, AL" />
                    <option value="Shkoder, AL" />
                    <option value="Roma, IT" />
                    <option value="Milano, IT" />
                    <option value="Napoli, IT" />
                  </datalist>
                </div>
                <button
                  type="submit"
                  className={`${primaryButtonClasses} px-6 py-2.5 font-semibold text-sm`}
                >
                  {t("common.actions.searchJobs")}
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className={`${secondaryButtonClasses} px-4 py-2.5 text-sm`}
                >
                  {t("common.actions.resetFilters")}
                </button>
              </form>
              {/* Quick refine controls */}
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("jobBoard.filters.workMode")}</span>
                  <div className="flex gap-1">
                    {optionsFromJobs.modes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setWorkMode((prev) => (prev === m ? null : m))}
                        className={`${workMode === m ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"} rounded-full px-2 py-1 text-xs font-medium`}
                      >
                        {beautifyEnum(m)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("jobBoard.filters.seniority")}</span>
                  <Dropdown
                    options={[
                      { value: "", label: t("jobBoard.filters.all") },
                      ...optionsFromJobs.seniorities.map((s) => ({
                        value: s,
                        label: beautifyEnum(s)
                      }))
                    ]}
                    value={seniority ?? ""}
                    onChange={(value) => setSeniority(value || null)}
                    placeholder={t("jobBoard.filters.all")}
                    searchPlaceholder={t("common.placeholders.search")}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("jobBoard.filters.employmentType")}</span>
                  <Dropdown
                    options={[
                      { value: "", label: t("jobBoard.filters.allTypes") },
                      ...optionsFromJobs.contracts.map((c) => ({
                        value: c,
                        label: beautifyEnum(c)
                      }))
                    ]}
                    value={employmentType ?? ""}
                    onChange={(value) => setEmploymentType(value || null)}
                    placeholder={t("jobBoard.filters.allTypes")}
                    searchPlaceholder={t("common.placeholders.search")}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("jobBoard.filters.sortBy")}</span>
                  <Dropdown
                    options={[
                      { value: "relevance", label: t("jobBoard.filters.relevance") },
                      { value: "newest", label: t("jobBoard.filters.newest") },
                      { value: "salaryHigh", label: t("jobBoard.filters.salaryHigh") },
                      { value: "salaryLow", label: t("jobBoard.filters.salaryLow") }
                    ]}
                    value={sortBy}
                    onChange={(value) => setSortBy(value as SortOption)}
                    placeholder={t("jobBoard.filters.relevance")}
                    searchPlaceholder={t("common.placeholders.search")}
                  />
                </div>

                {(workMode || seniority || employmentType) && (
                  <button
                    type="button"
                    onClick={() => { setWorkMode(null); setSeniority(null); setEmploymentType(null); setSortBy("relevance"); }}
                    className={`${secondaryButtonClasses} px-3 py-1 text-xs`}
                  >
                    {t("jobBoard.filters.clearRefinements")}
                  </button>
                )}
              </div>
              {hasActiveFilters && (
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">
                  {t("jobBoard.filters.active", {
                    summary: filtersSummary || t("common.info.none"),
                  })}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {loading && (
                <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="h-4 w-1/3 rounded bg-slate-200" />
                      <div className="mt-3 h-6 w-2/3 rounded bg-slate-200" />
                      <div className="mt-4 h-4 w-full rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-3/4 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
                  <p className="font-medium">{t("jobBoard.errors.generic")}</p>
                  <p className="mt-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setPage(0);
                      setActiveFilters({ ...activeFilters });
                    }}
                    className="mt-4 inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    {t("common.actions.retry")}
                  </button>
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <EmptyState onClearFilters={hasActiveFilters ? handleResetFilters : undefined} />
              )}

              {!loading && !error && refinedJobs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <span>{t("jobBoard.list.showing", { current: refinedJobs.length, total: totalElements })}</span>
                    <span>{t("jobBoard.list.page", { page: page + 1, total: Math.max(totalPages, 1) })}</span>
                  </div>
                  <div className="space-y-3">
                    {refinedJobs.map((job) => (
                      <JobCard key={job.id} job={job} onApply={handleApply} />
                    ))}
                  </div>
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          </div>        </section>
      </main>

      <ApplicationDialog
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
}

type JobCardProps = {
  job: JobPostDto;
  onApply: (job: JobPostDto) => void;
};

function JobCard({ job, onApply }: JobCardProps) {
  const t = useTranslations();
  const { locale } = useI18n();
  const formats = localeConfig[locale];
  const location = formatLocation(job, t("jobBoard.jobCard.locationFallback"));
  const salary = job.salaryVisible
    ? formatSalary(job.salaryMin, job.salaryMax, job.currency, formats.number, t)
    : t("jobBoard.jobCard.salaryHidden");
  const badges = [job.employmentType, job.seniority, job.distanceType].filter(Boolean);
  const requirements = extractRequirements(job.requirements).slice(0, 3);
  const publishedLabel = job.publishedAt
    ? t("jobBoard.jobCard.publishedAt", { relativeTime: formatRelativeTime(job.publishedAt, formats) })
    : "";
  const expiresLabel = job.expiresAt
    ? t("jobBoard.jobCard.expiresAt", { relativeTime: formatRelativeTime(job.expiresAt, formats) })
    : null;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {job.status ? beautifyEnum(job.status) : t("common.status.publication")}
          </div>
          <h2 className="text-xl font-semibold text-slate-900">{job.title}</h2>
          {location && <p className="text-base text-slate-600">{location}</p>}
        </div>
        <div className="text-base text-slate-500 sm:text-right">
          {publishedLabel && <p>{publishedLabel}</p>}
          {expiresLabel && <p className="text-xs text-slate-400">{expiresLabel}</p>}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
          {badges.map((badge) => (
            <Badge key={badge as string}>{beautifyEnum(badge as string)}</Badge>
          ))}
        </div>
      )}

      {job.description && (
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{truncate(job.description, 200)}</p>
      )}

      {requirements.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("jobBoard.jobCard.requirementsTitle")}
          </p>
          <ul className="mt-1 space-y-1 text-sm text-slate-600">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-slate-400" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-slate-900">{salary}</p>
          {job.expiresAt && <p className="text-xs text-slate-500">{expiresLabel}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApply(job)}
            className={`${primaryButtonClasses} px-4 py-2 font-semibold text-sm`}
          >
            {t("common.actions.applyNow")}
          </button>
        </div>
      </div>
    </article>
  );
}

function ApplicationDialog({ job, onClose, onSubmit }: ApplicationDialogProps) {
  const t = useTranslations();
  const [form, setForm] = useState<ApplicationFormState>({
    candidateName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    message: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      setForm({ candidateName: "", email: "", phone: "", resumeUrl: "", message: "" });
      setError(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [job]);

  if (!job) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = form.candidateName.trim();
    const trimmedEmail = form.email.trim();
    if (!trimmedName || !trimmedEmail) {
      setError(t("jobBoard.errors.applicationRequired"));
      return;
    }
    setError(null);
    onSubmit(form);
  };

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className={`${secondaryButtonClasses} absolute right-5 top-5 h-9 w-9 rounded-full p-0 text-base`}
          aria-label={t("jobBoard.dialog.close")}
        >
          x
        </button>
        <div className="pr-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("jobBoard.dialog.title")}</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {formatLocation(job, t("jobBoard.dialog.subtitleFallback"))}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="candidateName">{t("jobBoard.dialog.fields.name")}</Label>
            <Input
              id="candidateName"
              name="candidateName"
              value={form.candidateName}
              onChange={(event) => setForm((prev) => ({ ...prev, candidateName: event.target.value }))}
              placeholder={t("common.placeholders.candidateName")}
              required
            />
          </div>
          <div>
            <Label htmlFor="candidateEmail">{t("jobBoard.dialog.fields.email")}</Label>
            <Input
              id="candidateEmail"
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder={t("common.placeholders.candidateEmail")}
              required
            />
          </div>
          <div>
            <Label htmlFor="candidatePhone">{t("jobBoard.dialog.fields.phone")}</Label>
            <Input
              id="candidatePhone"
              name="phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder={t("common.placeholders.candidatePhone")}
            />
          </div>
          <div>
            <Label htmlFor="candidateResume">{t("jobBoard.dialog.fields.resume")}</Label>
            <Input
              id="candidateResume"
              name="resumeUrl"
              type="url"
              value={form.resumeUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, resumeUrl: event.target.value }))}
              placeholder={t("common.placeholders.candidateResume")}
            />
          </div>
          <div>
            <Label htmlFor="candidateMessage">{t("jobBoard.dialog.fields.message")}</Label>
            <Textarea
              id="candidateMessage"
              name="message"
              rows={4}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder={t("common.placeholders.candidateMessage")}
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`${ghostButtonClasses} px-4 py-2`}
            >
              {t("common.actions.cancel")}
            </button>
            <button
              type="submit"
              className={`${primaryButtonClasses} px-4 py-2 font-semibold`}
            >
              {t("jobBoard.dialog.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (!totalPages || totalPages <= 1) return null;
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>{t("jobBoard.pagination.label", { page: page + 1, total: totalPages })}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className={`${secondaryButtonClasses} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {t("jobBoard.pagination.previous")}
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className={`${primaryButtonClasses} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {t("jobBoard.pagination.next")}
        </button>
      </div>
    </div>
  );
}

type EmptyStateProps = {
  onClearFilters?: () => void;
};

function EmptyState({ onClearFilters }: EmptyStateProps) {
  const t = useTranslations();
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">ðŸ"</div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{t("jobBoard.emptyState.title")}</h3>
      <p className="mt-2 text-sm">{t("jobBoard.emptyState.description")}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a className={`${primaryButtonClasses} px-4 py-2 font-semibold`} href="#">
          {t("common.actions.receiveUpdates")}
        </a>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className={`${secondaryButtonClasses} px-4 py-2`}
          >
            {t("common.actions.clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
      {children}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { isClearable?: boolean };

function Input(props: InputProps) {
  const { isClearable = false, className, onChange, value, disabled, readOnly, ...rest } = props;
  const canClear = isClearable && !disabled && !readOnly && typeof value === "string" && value.length > 0;
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: "" } } as any);
    }
  };
  return (
    <div className="relative">
      <input
        {...rest}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-3 ${
          isClearable ? "pr-10" : ""
        } text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10 ${
          className ?? ""
        }`}
        onChange={onChange}
      />
      {canClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear input"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          x
        </button>
      )}
    </div>
  );
}

function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10 ${
        props.className ?? ""
      }`}
    />
  );
}

function beautifyEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function extractRequirements(value?: string | null) {
  if (!value) return [];
  return value
    .split(/\r?\n|\u2022|-|;/)
    .map((part) => part.replace(/^[-\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function formatSalary(
  min?: number | string | null,
  max?: number | string | null,
  currency?: string | null,
  numberLocale?: string,
  t?: TranslateFn
) {
  const fmt = new Intl.NumberFormat(numberLocale ?? "en-US", {
    style: "currency",
    currency: currency?.toUpperCase() || "EUR",
    maximumFractionDigits: 0,
  });
  const minValue = typeof min === "string" ? Number(min) : min;
  const maxValue = typeof max === "string" ? Number(max) : max;
  if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
    return t
      ? t("jobBoard.jobCard.salary.between", {
          min: fmt.format(minValue ?? 0),
          max: fmt.format(maxValue ?? 0),
        })
      : `${fmt.format(minValue ?? 0)} - ${fmt.format(maxValue ?? 0)}`;
  }
  if (Number.isFinite(minValue)) {
    const value = fmt.format(minValue ?? 0);
    return t ? t("jobBoard.jobCard.salary.from", { value }) : `da ${value}`;
  }
  if (Number.isFinite(maxValue)) {
    const value = fmt.format(maxValue ?? 0);
    return t ? t("jobBoard.jobCard.salary.to", { value }) : `fino a ${value}`;
  }
  return t ? t("jobBoard.jobCard.salary.unspecified") : "Retribuzione non specificata";
}

function formatLocation(job: JobPostDto, fallback: string) {
  const location = [job.city, job.region, job.countryCode].filter(Boolean).join(", ");
  if (location) return location;
  if (job.distanceType) return beautifyEnum(job.distanceType);
  return fallback;
}

function formatRelativeTime(
  isoDate: string,
  formats: { relative: string; date: string }
) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const absDays = Math.abs(diffDays);
  const formatter = new Intl.RelativeTimeFormat(formats.relative, { numeric: "auto" });
  if (absDays >= 7) {
    return new Intl.DateTimeFormat(formats.date, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }
  if (absDays >= 1) {
    return formatter.format(diffDays, "day");
  }
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) >= 1) {
    return formatter.format(diffHours, "hour");
  }
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return formatter.format(diffMinutes, "minute");
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}



type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  searchPlaceholder?: string;
};

function Dropdown({ options, value, onChange, placeholder = "Seleziona...", searchPlaceholder = "Cerca...", className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-7 w-full rounded-full border border-slate-200 bg-white px-3 text-left text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200 ${className}`}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[110] mt-1 max-h-60 min-w-full w-max overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="p-2">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-200"
                autoFocus
              />
            </div>
            <ul className="max-h-48 overflow-auto">
              {filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-slate-50 ${
                      option.value === value ? "bg-slate-100 font-medium text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
              {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-500">
                  Nessun risultato trovato
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function parseLocation(input: string): { city: string; country: string } {
  const value = input.trim();
  if (!value) return { city: "", country: "" };
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) {
    // Try to detect 2-letter country code
    const token = parts[0];
    if (/^[A-Za-z]{2}$/.test(token)) {
      return { city: "", country: token.toUpperCase() };
    }
    return { city: token, country: "" };
  }
  const city = parts.slice(0, -1).join(", ");
  const countryToken = parts[parts.length - 1];
  const country = /^[A-Za-z]{2}$/.test(countryToken) ? countryToken.toUpperCase() : countryToken;
  return { city, country };
}














