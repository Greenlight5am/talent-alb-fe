import { getSessionAccount } from "@/app/features/auth/useSession";
import { Link } from "react-router-dom";

export default function CompanyDashboard() {
  const acc = getSessionAccount();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Benvenuto, {acc?.email}</h1>
      <p className="text-gray-600">Area azienda: riepilogo rapido.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Profilo azienda" body={<>
          <p className="text-sm text-gray-600">Completa descrizione, sito e logo.</p>
          <Link to="/app/company/profile" className="inline-block mt-3 rounded-xl bg-black text-white px-3 py-2 text-sm">Modifica profilo</Link>
        </>} />
        <Card title="Team" body={<>
          <p className="text-sm text-gray-600">Gestisci gli utenti aziendali (Owner/Admin/Recruiter).</p>
          <Link to="/app/company/users" className="inline-block mt-3 rounded-xl border px-3 py-2 text-sm">Gestisci utenti</Link>
        </>} />
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: React.ReactNode }) {
  return <div className="rounded-2xl border p-4 bg-white shadow-sm">
    <div className="font-medium mb-2">{title}</div>{body}
  </div>;
}
