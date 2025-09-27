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

const baseButtonClasses =
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500";
const primaryButtonClasses =
  `${baseButtonClasses} bg-slate-800 text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-700`;
const secondaryButtonClasses =
  `${baseButtonClasses} border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50`;
const ghostButtonClasses =
  `${baseButtonClasses} text-slate-600 hover:text-slate-900 hover:bg-slate-100`;

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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-base font-semibold tracking-tight text-slate-900">
            TalentALB
          </Link>
          <nav className="flex items-center gap-2 text-sm text-slate-600">
            <a href="#jobs" className={`${ghostButtonClasses} px-3 py-2`}>
              Offerte
            </a>
            <a href="#candidature" className={`${ghostButtonClasses} px-3 py-2`}>
              Candidature
            </a>
            <Link
              to="/auth/signup"
              className={`${secondaryButtonClasses} px-3 py-2`}
            >
              Crea profilo
            </Link>
            <Link
              to="/app"
              className={`${primaryButtonClasses} px-3 py-2`}
            >
              Accedi
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20">
        <section className="py-12 text-center sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
            Job board TalentALB
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Tutte le opportunità, subito disponibili
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
            Sfoglia le posizioni aperte senza effettuare l&apos;accesso: ogni offerta è consultabile e candidabile in
            pochi passaggi. Quando troverai il ruolo giusto, potrai inviare la tua candidatura direttamente da qui.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-base">
            <a href="#jobs" className={`${primaryButtonClasses} px-4 py-2 font-semibold`}>
              Esplora le offerte
            </a>
            <Link
              to="/auth/signup"
              className={`${secondaryButtonClasses} px-4 py-2`}
            >
              Scopri TalentALB
            </Link>
          </div>
          {totalElements > 0 && (
            <p className="mt-6 text-xs text-slate-500">
              {totalElements} posizioni pubblicate in questo momento
            </p>
          )}
        </section>

        {feedback && (
          <div
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <form onSubmit={handleSubmitFilters} className="grid gap-4 sm:grid-cols-3 sm:items-end">
                <div className="sm:col-span-2">
                  <Label htmlFor="search">Parola chiave</Label>
                  <Input
                    id="search"
                    name="search"
                    placeholder="es. product manager, sviluppatore, marketing"
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
                <div className="flex flex-col gap-2 sm:col-span-3 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    className={`${primaryButtonClasses} flex-1 px-4 py-2.5 font-semibold text-base`}
                  >
                    Cerca offerte
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className={`${secondaryButtonClasses} px-4 py-2.5 text-base`}
                  >
                    Azzera filtri
                  </button>
                </div>
              </form>
              {hasActiveFilters && (
                <p className="mt-4 text-sm uppercase tracking-wide text-slate-500">
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
                  <p className="font-medium">Si è verificato un problema</p>
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
                    Riprova
                  </button>
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <EmptyState onClearFilters={hasActiveFilters ? handleResetFilters : undefined} />
              )}

              {!loading && !error && jobs.length > 0 && (
                <div className="space-y-5">
                  <div className="flex flex-col gap-1 text-base text-slate-600 sm:flex-row sm:items-center sm:justify-between">
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
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {job.status ? beautifyEnum(job.status) : "Pubblicazione"}
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
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
          {badges.map((badge) => (
            <Badge key={badge as string}>{beautifyEnum(badge as string)}</Badge>
          ))}
        </div>
      )}

      {job.description && (
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {truncate(job.description, 260)}
        </p>
      )}

      {requirements.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requisiti principali</p>
          <ul className="mt-2 space-y-2 text-base text-slate-600">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4 text-base sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-slate-900">{salary}</p>
          {job.expiresAt && <p className="text-xs text-slate-500">{expiresLabel}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApply(job)}
            className={`${primaryButtonClasses} px-4 py-2.5 font-semibold text-base`}
          >
            Candidati ora
          </button>
          <a href="#candidature" className={`${secondaryButtonClasses} px-4 py-2.5 text-base`}>
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
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Le tue candidature</h2>
        <p className="text-base text-slate-600">
          Salviamo in locale le posizioni che scegli di candidare così puoi ritrovarle rapidamente.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-base text-slate-600">
          Nessuna candidatura inviata al momento. Seleziona <span className="font-medium text-slate-900">"Candidati ora"</span>
          su una posizione per creare la tua prima candidatura.
        </div>
      ) : (
        <ul className="space-y-3">
          {applications.map((app) => (
            <li key={app.id} className="rounded-xl border border-slate-200 p-4">
              <div className="text-base font-semibold text-slate-900">{app.jobTitle}</div>
              <div className="mt-1 text-sm uppercase tracking-wide text-slate-500">
                Inviata il {formatDate(app.createdAt)}
              </div>
              <div className="mt-3 space-y-1 text-base text-slate-600">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-10 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className={`${secondaryButtonClasses} absolute right-5 top-5 h-9 w-9 rounded-full p-0 text-base`}
          aria-label="Chiudi"
        >
          ✕
        </button>
        <div className="pr-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Candidatura rapida</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{job.title}</h2>
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
              className={`${ghostButtonClasses} px-4 py-2`}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`${primaryButtonClasses} px-4 py-2 font-semibold`}
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
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
      <span>
        Pagina <span className="font-semibold text-slate-900">{page + 1}</span> di {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className={`${secondaryButtonClasses} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Precedente
        </button>
        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className={`${primaryButtonClasses} px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60`}
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
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">🔍</div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">Nessuna offerta trovata</h3>
      <p className="mt-2 text-sm">
        Modifica i filtri di ricerca oppure torna più tardi: il job board viene aggiornato di frequente con nuove posizioni.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a className={`${primaryButtonClasses} px-4 py-2 font-semibold`} href="#">
          Ricevi aggiornamenti
        </a>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className={`${secondaryButtonClasses} px-4 py-2`}
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

function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900/10 ${
        props.className ?? ""
      }`}
    />
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
