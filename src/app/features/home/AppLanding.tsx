import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/app/features/auth/useSession";

const DASHBOARD_ROUTE = "/app/me";
const DEFAULT_ROLE_REDIRECTS = new Set(["CANDIDATE", "EMPLOYER", "ADMIN"]);

export default function AppLanding() {
  const { account } = useSession();
  const roles = new Set(account?.roles ?? []);
  const hasKnownRole = Array.from(DEFAULT_ROLE_REDIRECTS).some((role) => roles.has(role));

  if (account && hasKnownRole) {
    return <Navigate to={DASHBOARD_ROUTE} replace />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Benvenuto in TalentALB</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Accedi all&apos;anteprima della piattaforma anche senza un account: esplora le funzionalità, consulta la
          ricerca talenti e scopri come gestire le candidature. Quando sarai pronto potrai creare l&apos;account in
          qualsiasi momento.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/auth/signup"
            className="rounded-2xl bg-black px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-black/90"
          >
            Crea un account
          </Link>
          <Link
            to="/app/search"
            className="rounded-2xl border border-gray-200 px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Inizia ad esplorare
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <FeatureCard
          title="Per i candidati"
          description="Compila il profilo, carica CV e allegati e gestisci le candidature in maniera semplice."
          actionLabel="Guarda il profilo demo"
          to="/app/candidate"
          disabled={!account}
        />
        <FeatureCard
          title="Per le aziende"
          description="Crea e gestisci il tuo profilo aziendale, invita i recruiter e pubblica le offerte di lavoro."
          actionLabel="Scopri l&apos;area azienda"
          to="/app/company"
          disabled={!account}
        />
      </section>

      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Candidati solo quando vuoi</h2>
        <p className="mt-2 text-gray-600">
          Stai navigando come ospite. Quando vorrai candidarti ad una posizione o salvare le tue preferenze ti
          chiederemo di registrarti. Fino ad allora puoi continuare a muoverti liberamente nella piattaforma.
        </p>
        <Link
          to="/auth/signup"
          className="mt-4 inline-flex rounded-2xl bg-black px-5 py-2 text-sm font-medium text-white shadow transition hover:bg-black/90"
        >
          Registrati ora
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  actionLabel,
  to,
  disabled,
}: {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <Link
        to={disabled ? "/auth/signup" : to}
        className="mt-4 inline-flex rounded-2xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
      >
        {disabled ? "Registrati per continuare" : actionLabel}
      </Link>
    </div>
  );
}
