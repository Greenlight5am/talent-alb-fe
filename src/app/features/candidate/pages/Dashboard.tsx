import { getSessionAccount } from "@/app/features/auth/useSession";
import { Link } from "react-router-dom";

export default function CandidateDashboard() {
  const acc = getSessionAccount();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ciao, {acc?.email}</h1>
      <p className="text-gray-600">Benvenuto nella tua area candidato.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Completamento profilo" body={<>
          <p className="text-sm text-gray-600">Aggiungi headline, about, città e competenze.</p>
          <Link to="/app/candidate/profile" className="inline-block mt-3 rounded-xl bg-black text-white px-3 py-2 text-sm">Completa profilo</Link>
        </>} />
        <Card title="CV & Allegati" body={<>
          <p className="text-sm text-gray-600">Carica il tuo CV e altri documenti.</p>
          <Link to="/app/candidate/attachments" className="inline-block mt-3 rounded-xl border px-3 py-2 text-sm">Vai alla sezione</Link>
        </>} />
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4 bg-white shadow-sm">
      <div className="font-medium mb-2">{title}</div>
      <div>{body}</div>
    </div>
  );
}
