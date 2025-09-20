import { useEffect, useState } from "react";
type Draft = { name?: string; legalName?: string; website?: string; size?: string; industry?: string; city?: string; region?: string; countryCode?: string; description?: string; logoUrl?: string; status?: string; };
const KEY = "company_profile_draft";

export default function CompanyProfileEdit() {
  const [draft, setDraft] = useState<Draft>({ status: "ACTIVE" });
  useEffect(() => { try { const saved = localStorage.getItem(KEY); if (saved) setDraft(JSON.parse(saved)); } catch {} }, []);
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
      <h2 className="text-xl font-semibold mb-4">Profilo azienda</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Name"      name="name"      value={draft.name}      onChange={(v:string)=>setDraft(d=>({...d,name:v}))}/>
        <Field label="Legal name" name="legalName" value={draft.legalName} onChange={(v:string)=>setDraft(d=>({...d,legalName:v}))}/>
        <Field label="Website"   name="website"   value={draft.website}   onChange={(v:string)=>setDraft(d=>({...d,website:v}))}/>
        <Field label="Size"      name="size"      value={draft.size}      onChange={(v:string)=>setDraft(d=>({...d,size:v}))}/>
        <Field label="Industry"  name="industry"  value={draft.industry}  onChange={(v:string)=>setDraft(d=>({...d,industry:v}))}/>
        <Field label="City"      name="city"      value={draft.city}      onChange={(v:string)=>setDraft(d=>({...d,city:v}))}/>
        <Field label="Region"    name="region"    value={draft.region}    onChange={(v:string)=>setDraft(d=>({...d,region:v}))}/>
        <Field label="Country"   name="country"   value={draft.countryCode} onChange={(v:string)=>setDraft(d=>({...d,countryCode:v}))}/>
        <Field label="Logo URL"  name="logoUrl"   value={draft.logoUrl}   onChange={(v:string)=>setDraft(d=>({...d,logoUrl:v}))}/>
        <Field label="Status"    name="status"    value={draft.status}    onChange={(v:string)=>setDraft(d=>({...d,status:v}))}/>
      </div>
      <label className="block mb-4">
        <span className="block text-sm font-medium mb-1">Description</span>
        <textarea className="w-full rounded-2xl border p-3 shadow-sm focus:outline-none focus:ring min-h-[120px]"
          value={draft.description || ""} onChange={(e)=>setDraft(d=>({...d, description:e.target.value}))}/>
      </label>
      <button onClick={save} className="rounded-2xl bg-black text-white px-4 py-2">Salva bozza</button>
      <p className="text-xs text-gray-500 mt-2">⚠️ Mock locale. Collegheremo le API `/api/company/me` quando pronte.</p>
    </div>
  );
}
