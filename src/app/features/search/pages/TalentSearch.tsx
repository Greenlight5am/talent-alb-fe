export default function TalentSearch() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Cerca talenti</h2>
      <p className="text-gray-600 text-sm">Quando abiliterai le API, qui useremo i tuoi repository per visibilità/nome/città.</p>
      <div className="rounded-2xl border p-4 bg-white shadow-sm">
        <input className="w-full rounded-2xl border p-3 shadow-sm" placeholder="Cerca per nome/cognome/città…" />
        <div className="text-xs text-gray-500 mt-2">Demo statica.</div>
      </div>
    </div>
  );
}
