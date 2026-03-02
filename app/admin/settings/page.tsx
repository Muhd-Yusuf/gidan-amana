"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";

const DEFAULT_SETTINGS = {
  cardTitle: "GIDAN AMANA MOVEMENT",
  cardSubtitle: "MEMBERSHIP CARD",
  state: "KATSINA STATE, NIGERIA",
  lga: "",
  issueDate: "",
  expiryDate: "",
  chairmanTitle: "NATIONAL CHAIRMAN",
  chairmanName: "",
  secretaryTitle: "NATIONAL SECRETARY",
  secretaryName: "",
  footerText: "GIDAN AMANA MOVEMENT • UNITY • PROGRESS • TRUST",
  logoUrl: "",
};

type SettingsKey = keyof typeof DEFAULT_SETTINGS;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        setForm((f) => {
          const updated = { ...f };
          for (const key of Object.keys(DEFAULT_SETTINGS) as SettingsKey[]) {
            if (data[key] !== undefined) updated[key] = data[key];
          }
          return updated;
        });
        if (data.logoUrl) setLogoPreview(data.logoUrl);
      });
  }, []);

  const set = (key: SettingsKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setLogoPreview(base64);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64, folder: "gidan-amana/logos" }),
        });
        const data = await res.json();
        if (data.url) {
          setForm((f) => ({ ...f, logoUrl: data.url }));
          setLogoPreview(data.url);
        }
      } finally {
        setLogoUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";

  return (
    <AuthGuard>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-green-900 mb-2">Card Settings</h1>
        <p className="text-sm text-gray-500 mb-6">These settings control what appears on every generated ID card.</p>

        <form onSubmit={handleSave} className="flex flex-col gap-8">

          {/* ─── Logo ─── */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-widest border-b pb-2">Card Logo</h2>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-green-700 overflow-hidden bg-green-50 flex items-center justify-center flex-shrink-0">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-green-300 text-3xl">🖼️</span>
                )}
              </div>
              <div className="flex-1">
                <label className={`cursor-pointer inline-block bg-green-800 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${logoUploading ? "opacity-50 pointer-events-none" : ""}`}>
                  {logoUploading ? "Uploading..." : "Upload Logo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                <p className="text-xs text-gray-400 mt-2">PNG or SVG recommended. Will appear in the circle at the top of the ID card.</p>
                {form.logoUrl && (
                  <button type="button" onClick={() => { setForm((f) => ({ ...f, logoUrl: "" })); setLogoPreview(""); }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 block">
                    Remove logo
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ─── Card Identity ─── */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-widest border-b pb-2">Card Identity</h2>
            <Field label="Card Title" hint="Main heading on the card (e.g. movement name)">
              <input type="text" value={form.cardTitle} onChange={set("cardTitle")} className={inputClass} />
            </Field>
            <Field label="Card Subtitle" hint="Shown below the title (e.g. MEMBERSHIP CARD)">
              <input type="text" value={form.cardSubtitle} onChange={set("cardSubtitle")} className={inputClass} />
            </Field>
            <Field label="Footer Text" hint="Text shown in the bottom green bar of the card">
              <input type="text" value={form.footerText} onChange={set("footerText")} className={inputClass} />
            </Field>
          </section>

          {/* ─── Location ─── */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-widest border-b pb-2">Location</h2>
            <Field label="State" hint="Shown below the movement name on the card header">
              <input type="text" value={form.state} onChange={set("state")} className={inputClass} placeholder="e.g. KATSINA STATE, NIGERIA" />
            </Field>
            <Field label="Default LGA" hint="Shown in the LGA field if member does not have a specific one">
              <input type="text" value={form.lga} onChange={set("lga")} className={inputClass} placeholder="e.g. KATSINA LGA" />
            </Field>
          </section>

          {/* ─── Validity ─── */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-widest border-b pb-2">Card Validity</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Default Issue Date" hint="Leave blank to auto-use today">
                <input type="date" value={form.issueDate} onChange={set("issueDate")} className={inputClass} />
              </Field>
              <Field label="Default Expiry Date">
                <input type="date" value={form.expiryDate} onChange={set("expiryDate")} className={inputClass} />
              </Field>
            </div>
          </section>

          {/* ─── Signatures ─── */}
          <section className="bg-white rounded-xl shadow p-6 flex flex-col gap-5">
            <h2 className="text-sm font-bold text-green-800 uppercase tracking-widest border-b pb-2">Signature Labels</h2>
            <p className="text-xs text-gray-400 -mt-2">These labels appear below the signature lines on the front of the ID card.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Chairman Title">
                <input type="text" value={form.chairmanTitle} onChange={set("chairmanTitle")} className={inputClass} placeholder="NATIONAL CHAIRMAN" />
              </Field>
              <Field label="Chairman Name" hint="Optional — printed under the title">
                <input type="text" value={form.chairmanName} onChange={set("chairmanName")} className={inputClass} placeholder="Full name (optional)" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Secretary Title">
                <input type="text" value={form.secretaryTitle} onChange={set("secretaryTitle")} className={inputClass} placeholder="NATIONAL SECRETARY" />
              </Field>
              <Field label="Secretary Name" hint="Optional — printed under the title">
                <input type="text" value={form.secretaryName} onChange={set("secretaryName")} className={inputClass} placeholder="Full name (optional)" />
              </Field>
            </div>
          </section>

          <button type="submit" disabled={loading}
            className="bg-green-800 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-base">
            {loading ? "Saving..." : "Save All Settings"}
          </button>
          {saved && <p className="text-green-600 text-sm text-center font-semibold -mt-4">✓ Settings saved successfully!</p>}
        </form>
      </div>
    </AuthGuard>
  );
}
