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

type JobApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  message?: string;
  createdAt: string;
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
const APPLICATIONS_STORAGE_KEY = "talentalb:applications";

export default function JobBoardPage() {
  const [formState, setFormState] = useState<FiltersState>(DEFAULT_FILTERS);
  const [activeFilters, setActiveFilters] = useState<FiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [jobsPage, setJobsPage] = useState<PageResponse<JobPostDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPostDto | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage>(null);

  const [applications, setApplications] = usePersistentState<JobApplication[]>(
    APPLICATIONS_STORAGE_KEY,
    []
  );

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
          throw new Error(`Errore ${res.status}: impossibile caricare le offerte`);
        }
        const data = (await res.json()) as PageResponse<JobPostDto>;
        setJobsPage(data);
        if (page !== data.number) {
          setPage(data.number);
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message || "Impossibile caricare le offerte");
        setJobsPage(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => controller.abort();
  }, [page, activeFilters.q, activeFilters.city, activeFilters.country]);

  const jobs = jobsPage?.content ?? [];
  const totalPages = jobsPage?.totalPages ?? 0;
  const totalElements = jobsPage?.totalElements ?? 0;

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const filtersSummary = useMemo(() => {
    const parts: string[] = [];
    if (activeFilters.q.trim()) parts.push(`chiave: "${activeFilters.q.trim()}"`);
    if (activeFilters.city.trim()) parts.push(activeFilters.city.trim());
    if (activeFilters.country.trim()) parts.push(activeFilters.country.trim());
    return parts.join(" · ");
  }, [activeFilters]);

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
    setFeedback({ kind: "success", message: `Candidatura inviata per "${selectedJob.title}"` });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      activeFilters.q.trim().length > 0 ||
      activeFilters.city.trim().length > 0 ||
      activeFilters.country.trim().length > 0
    );
  }, [activeFilters]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            TalentALB
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <a href="#jobs" className="rounded-xl px-3 py-2 transition hover:bg-slate-100">
              Offerte
            </a>
            <a href="#candidature" className="rounded-xl px-3 py-2 transition hover:bg-slate-100">
              Le tue candidature
            </a>
            <Link
              to="/app"
              className="rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Accedi all&apos;area riservata
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="py-12 sm:py-16">
          <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-[3fr_2fr] sm:p-12">
            <div>
              <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Il marketplace del talento albanese
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Scopri tutte le opportunità aperte su TalentALB
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Consulta gli annunci pubblicati dalle aziende partner e candida il tuo profilo in pochi passaggi.
                Nessun account è richiesto per esplorare le offerte: quando troverai il ruolo perfetto potrai
                candidarti direttamente da qui.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <a
                  href="#jobs"
                  className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-2 font-medium text-white shadow-sm transition hover:bg-slate-900/90"
                >
                  Esplora le offerte
                </a>
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center rounded-2xl border border-slate-300 px-5 py-2 font-medium text-slate-900 transition hover:bg-slate-100"
                >
                  Crea il tuo profilo
                </Link>
              </div>
            </div>
            <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-lg">
              <div className="relative z-10 space-y-4">
                <h2 className="text-lg font-semibold">Perché unirti a TalentALB?</h2>
                <ul className="space-y-3 text-sm leading-relaxed text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Annunci curati da aziende qualificate del network.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Processo di candidatura semplice, veloce e trasparente.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span>Supporto del team TalentALB in ogni fase del percorso.</span>
                  </li>
                </ul>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-xs font-medium uppercase tracking-wide text-white/80">
                  +{Math.max(totalElements, 0)} posizioni seguite ogni mese
                </div>
              </div>
              <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-emerald-500/30 blur-3xl" />
            </div>
          </div>
        </section>

        {feedback && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
              feedback.kind === "success"
                ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                : "border-rose-100 bg-rose-50 text-rose-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <section id="jobs" className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <form onSubmit={handleSubmitFilters} className="grid gap-4 sm:grid-cols-3 sm:items-end">
                <div className="sm:col-span-2">
                  <Label htmlFor="search">Parola chiave</Label>
                  <Input
                    id="search"
                    name="search"
                    placeholder="es. marketing, sviluppatore, fintech"
                    value={formState.q}
                    onChange={(event) => setFormState((prev) => ({ ...prev, q: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Paese</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="es. Albania"
                    value={formState.country}
                    onChange={(event) => setFormState((prev) => ({ ...prev, country: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Città</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="es. Tirana"
                    value={formState.city}
                    onChange={(event) => setFormState((prev) => ({ ...prev, city: event.target.value }))}
                  />
                </div>
                <div className="flex gap-2 sm:col-span-3">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900/90"
                  >
                    Cerca offerte
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Reset
                  </button>
                </div>
              </form>
              {hasActiveFilters && (
                <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
                  Filtri attivi: {filtersSummary || "nessuno"}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
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
                <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm">
                  <p className="font-medium">Si è verificato un problema</p>
                  <p className="mt-1 text-rose-700">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setPage(0);
                      setActiveFilters({ ...activeFilters });
                    }}
                    className="mt-4 inline-flex items-center rounded-2xl border border-rose-200 px-4 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    Riprova
                  </button>
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <EmptyState onClearFilters={hasActiveFilters ? handleResetFilters : undefined} />
              )}

              {!loading && !error && jobs.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                      Mostrando {jobs.length} di {totalElements} offerte
                    </span>
                    <span>Pagina {page + 1} di {Math.max(totalPages, 1)}</span>
                  </div>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard key={job.id} job={job} onApply={handleApply} />
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </div>
          </div>

          <ApplicationsPanel applications={applications} />
        </section>
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
  const location = formatLocation(job);
  const salary = job.salaryVisible ? formatSalary(job.salaryMin, job.salaryMax, job.currency) : "Retribuzione riservata";
  const badges = [job.employmentType, job.seniority, job.distanceType].filter(Boolean);
  const requirements = extractRequirements(job.requirements).slice(0, 3);
  const publishedLabel = job.publishedAt ? `Pubblicato ${formatRelativeTime(job.publishedAt)}` : "";
  const expiresLabel = job.expiresAt ? `Scade ${formatRelativeTime(job.expiresAt)}` : null;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {job.status ? beautifyEnum(job.status) : "Pubblicazione"}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{job.title}</h2>
          {location && <p className="mt-1 text-sm text-slate-600">{location}</p>}
        </div>
        <div className="text-right text-sm text-slate-500">
          {publishedLabel && <p>{publishedLabel}</p>}
          {expiresLabel && <p className="text-xs text-slate-400">{expiresLabel}</p>}
        </div>
      </div>

      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge as string}>{beautifyEnum(badge as string)}</Badge>
          ))}
        </div>
      )}

      {job.description && (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {truncate(job.description, 260)}
        </p>
      )}

      {requirements.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requisiti principali</p>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm">
        <div>
          <p className="font-medium text-slate-900">{salary}</p>
          {job.expiresAt && (
            <p className="text-xs text-slate-500">{expiresLabel}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onApply(job)}
            className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900/90"
          >
            Candidati ora
          </button>
          <a
            href="#candidature"
            className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Salva per dopo
          </a>
        </div>
      </div>
    </article>
  );
}

type ApplicationsPanelProps = {
  applications: JobApplication[];
};

function ApplicationsPanel({ applications }: ApplicationsPanelProps) {
  return (
    <aside
      id="candidature"
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Le tue candidature</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tieni traccia delle posizioni per cui hai inviato il profilo. Salveremo le candidature direttamente sul tuo
          dispositivo.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          Nessuna candidatura inviata al momento. Seleziona <span className="font-medium text-slate-900">"Candidati ora"</span>
          su una posizione per creare la tua prima candidatura.
        </div>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-900">{app.jobTitle}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                Inviata il {formatDate(app.createdAt)}
              </div>
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">{app.candidateName}</span>
                  {app.email && <span className="text-slate-500"> · {app.email}</span>}
                </p>
                {app.phone && <p>Telefono: {app.phone}</p>}
                {app.resumeUrl && (
                  <p>
                    CV: <a href={app.resumeUrl} className="text-slate-900 underline" target="_blank" rel="noreferrer">{app.resumeUrl}</a>
                  </p>
                )}
                {app.message && <p className="text-slate-500">“{app.message}”</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

type ApplicationDialogProps = {
  job: JobPostDto | null;
  onClose: () => void;
  onSubmit: (form: ApplicationFormState) => void;
};

function ApplicationDialog({ job, onClose, onSubmit }: ApplicationDialogProps) {
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
      setError("Nome e email sono obbligatori");
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-10"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label="Chiudi"
        >
          ✕
        </button>
        <div className="pr-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Candidatura rapida</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{formatLocation(job) || "Azienda del network TalentALB"}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="candidateName">Nome e cognome</Label>
            <Input
              id="candidateName"
              name="candidateName"
              value={form.candidateName}
              onChange={(event) => setForm((prev) => ({ ...prev, candidateName: event.target.value }))}
              placeholder="Il tuo nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="candidateEmail">Email</Label>
            <Input
              id="candidateEmail"
              type="email"
              name="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="nome@dominio.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="candidatePhone">Telefono</Label>
            <Input
              id="candidatePhone"
              name="phone"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="(+355) 123 456 789"
            />
          </div>
          <div>
            <Label htmlFor="candidateResume">Link al CV (opzionale)</Label>
            <Input
              id="candidateResume"
              name="resumeUrl"
              type="url"
              value={form.resumeUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, resumeUrl: event.target.value }))}
              placeholder="https://"
            />
          </div>
          <div>
            <Label htmlFor="candidateMessage">Messaggio di presentazione</Label>
            <Textarea
              id="candidateMessage"
              name="message"
              rows={4}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Parlaci di te, delle tue motivazioni e dei risultati più importanti."
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900/90"
            >
              Invia candidatura
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

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>
        Pagina <span className="font-semibold text-slate-900">{page + 1}</span> di {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Precedente
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-slate-900/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Successiva
        </button>
      </div>
    </div>
  );
}

type EmptyStateProps = {
  onClearFilters?: () => void;
};

function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-600 shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">🔍</div>
      <h3 className="mt-6 text-lg font-semibold text-slate-900">Nessuna offerta trovata</h3>
      <p className="mt-2 text-sm">
        Prova a modificare i filtri di ricerca oppure torna più tardi: nuove posizioni vengono aggiunte ogni settimana.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-900/90"
          href="#"
        >
          Ricevi aggiornamenti
        </a>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Rimuovi filtri
          </button>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
        props.className ?? ""
      }`}
    />
  );
}

function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
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
  return `${value.slice(0, maxLength - 1)}…`;
}

function extractRequirements(value?: string | null) {
  if (!value) return [];
  return value
    .split(/\r?\n|•|-|;/)
    .map((part) => part.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean);
}

function formatSalary(min?: number | string | null, max?: number | string | null, currency?: string | null) {
  const fmt = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency?.toUpperCase() || "EUR",
    maximumFractionDigits: 0,
  });
  const minValue = typeof min === "string" ? Number(min) : min;
  const maxValue = typeof max === "string" ? Number(max) : max;
  if (Number.isFinite(minValue) && Number.isFinite(maxValue)) {
    return `${fmt.format(minValue ?? 0)} - ${fmt.format(maxValue ?? 0)}`;
  }
  if (Number.isFinite(minValue)) return `da ${fmt.format(minValue ?? 0)}`;
  if (Number.isFinite(maxValue)) return `fino a ${fmt.format(maxValue ?? 0)}`;
  return "Retribuzione non specificata";
}

function formatLocation(job: JobPostDto) {
  const location = [job.city, job.region, job.countryCode].filter(Boolean).join(", ");
  if (location) return location;
  if (job.distanceType) return beautifyEnum(job.distanceType);
  return "Località non indicata";
}

function formatRelativeTime(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const absDays = Math.abs(diffDays);
  const formatter = new Intl.RelativeTimeFormat("it", { numeric: "auto" });
  if (absDays >= 7) {
    return new Intl.DateTimeFormat("it-IT", {
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

function formatDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}

function usePersistentState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) return defaultValue;
      return JSON.parse(stored) as T;
    } catch (err) {
      console.warn("Impossibile leggere dallo storage", err);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (err) {
      console.warn("Impossibile scrivere nello storage", err);
    }
  }, [key, state]);

  return [state, setState] as const;
}
