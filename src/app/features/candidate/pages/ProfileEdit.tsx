import { useEffect, useState } from "react";

type Draft = {
  firstName?: string; lastName?: string; headline?: string; about?: string;
  phone?: string; city?: string; region?: string; countryCode?: string;
  visibility?: "PUBLIC" | "PRIVATE";
};
const KEY = "candidate_profile_draft";

export default function CandidateProfileEdit() {
  const [draft, setDraft] = useState<Draft>({ visibility: "PUBLIC" });

  useEffect(() => {
    try { const saved = localStorage.getItem(KEY); if (saved) setDraft(JSON.parse(saved)); } catch {}
  }, []);
  function save() { localStorage.setItem(KEY, JSON.stringify(draft)); alert("Bozza salvata (localStorage)."); }

  function Field({ label, name, value, onChange, type="text"}: any) {
    return (
      <label className="block mb-3">
        <span className="block text-sm font-medium mb-1">{label}</span>
        <input className="w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring" name={name} value={value || ""} onChange={(e)=>onChange(e.target.value)} type={type}/>
      </label>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Modifica profilo candidato</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="First name" name="firstName" value={draft.firstName} onChange={(v: string)=>setDraft(d=>({...d, firstName:v}))}/>
        <Field label="Last name"  name="lastName"  value={draft.lastName}  onChange={(v: string)=>setDraft(d=>({...d, lastName:v}))}/>
        <Field label="Headline"   name="headline"  value={draft.headline}  onChange={(v: string)=>setDraft(d=>({...d, headline:v}))}/>
        <Field label="Phone"      name="phone"     value={draft.phone}     onChange={(v: string)=>setDraft(d=>({...d, phone:v}))}/>
        <Field label="City"       name="city"      value={draft.city}      onChange={(v: string)=>setDraft(d=>({...d, city:v}))}/>
        <Field label="Region"     name="region"    value={draft.region}    onChange={(v: string)=>setDraft(d=>({...d, region:v}))}/>
        <Field label="Country"    name="country"   value={draft.countryCode} onChange={(v: string)=>setDraft(d=>({...d, countryCode:v}))}/>
      </div>
      <label className="block mb-3">
        <span className="block text-sm font-medium mb-1">About</span>
        <textarea className="w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring min-h-[120px]"
          value={draft.about || ""} onChange={(e)=>setDraft(d=>({...d, about:e.target.value}))}/>
      </label>
      <label className="block mb-4">
        <span className="block text-sm font-medium mb-1">Visibility</span>
        <select className="w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring"
          value={draft.visibility} onChange={(e)=>setDraft(d=>({...d, visibility:e.target.value as Draft["visibility"]}))}>
          <option value="PUBLIC">PUBLIC</option>
          <option value="PRIVATE">PRIVATE</option>
        </select>
      </label>
      <button onClick={save} className="rounded-2xl bg-black text-white px-4 py-2">Salva bozza</button>
      <p className="text-xs text-gray-500 mt-2">⚠️ Solo mock locale. Quando esporrai le API candidate, collegheremo GET/PUT reali.</p>
    </div>
  );
}
