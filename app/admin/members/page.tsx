"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import AuthGuard from "@/components/AuthGuard";
import dynamic from "next/dynamic";
import type { IDCardData } from "@/components/IDCard";

const IDCard = dynamic(() => import("@/components/IDCard"), { ssr: false });

interface Member {
  id: string;
  memberId: string;
  name: string;
  photoUrl?: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  ward: { id: string; name: string };
  pollingUnit: { id: string; name: string };
  createdAt: string;
}

interface Ward {
  id: string;
  name: string;
  pollingUnits: { id: string; name: string }[];
}

// ─── Card Preview Modal ─────────────────────────────────────────────────────
function PreviewModal({ member, settings, onClose }: {
  member: Member;
  settings: Record<string, string>;
  onClose: () => void;
}) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const cardData: IDCardData = {
    memberId: member.memberId, name: member.name, photoUrl: member.photoUrl,
    dob: member.dob, issueDate: member.issueDate, expiryDate: member.expiryDate,
    ward: member.ward.name, pollingUnit: member.pollingUnit.name,
    cardTitle: settings.cardTitle, cardSubtitle: settings.cardSubtitle,
    state: settings.state, lga: settings.lga,
    chairmanTitle: settings.chairmanTitle, chairmanName: settings.chairmanName,
    secretaryTitle: settings.secretaryTitle, secretaryName: settings.secretaryName,
    footerText: settings.footerText, logoUrl: settings.logoUrl,
  };

  const handleDownload = async () => {
    if (!frontRef.current || !backRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const { CARD_WIDTH, CARD_HEIGHT } = await import("@/components/IDCard");

    const canvasFront = await html2canvas(frontRef.current, { scale: 3, useCORS: true, backgroundColor: null });
    const canvasBack = await html2canvas(backRef.current, { scale: 3, useCORS: true, backgroundColor: null });
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [CARD_WIDTH, CARD_HEIGHT] });
    pdf.addImage(canvasFront.toDataURL("image/png"), "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT);
    pdf.addPage([CARD_WIDTH, CARD_HEIGHT], "portrait");
    pdf.addImage(canvasBack.toDataURL("image/png"), "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT);
    pdf.save(`${member.memberId}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-green-900">{member.name}</h2>
            <p className="text-sm font-mono text-green-700">{member.memberId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-6">
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Front</p>
            <IDCard ref={frontRef} data={cardData} side="front" forExport />
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Back</p>
            <IDCard ref={backRef} data={cardData} side="back" forExport />
          </div>
        </div>
        <button onClick={handleDownload}
          className="w-full bg-green-800 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">
          Download PDF (Front + Back)
        </button>
      </div>
    </div>
  );
}

// ─── Edit Member Modal ───────────────────────────────────────────────────────
function EditModal({ member, wards, onClose, onSaved }: {
  member: Member;
  wards: Ward[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: member.name,
    dob: member.dob,
    wardId: member.ward.id,
    pollingUnitId: member.pollingUnit.id,
    photoBase64: "",
    photoPreview: member.photoUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedWard = wards.find((w) => w.id === form.wardId);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target?.result as string;
      setForm((f) => ({ ...f, photoBase64: b64, photoPreview: b64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/members/${member.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        dob: form.dob,
        wardId: form.wardId,
        pollingUnitId: form.pollingUnitId,
        photoBase64: form.photoBase64 || undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to save");
      return;
    }
    onSaved();
    onClose();
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-green-900">Edit Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-light">×</button>
        </div>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-green-700 overflow-hidden bg-green-50 flex items-center justify-center flex-shrink-0">
              {form.photoPreview
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={form.photoPreview} alt="" className="w-full h-full object-cover" />
                : <span className="text-green-300 text-2xl">{form.name.charAt(0)}</span>
              }
            </div>
            <label className="cursor-pointer bg-green-800 text-white text-xs px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors">
              Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
            <input required type="date" value={form.dob} onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ward</label>
            <select required value={form.wardId}
              onChange={(e) => setForm((f) => ({ ...f, wardId: e.target.value, pollingUnitId: "" }))}
              className={inputClass}>
              <option value="">Select Ward</option>
              {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Polling Unit</label>
            <select required value={form.pollingUnitId}
              onChange={(e) => setForm((f) => ({ ...f, pollingUnitId: e.target.value }))}
              disabled={!form.wardId} className={`${inputClass} disabled:opacity-50`}>
              <option value="">Select Polling Unit</option>
              {selectedWard?.pollingUnits.map((pu) => <option key={pu.id} value={pu.id}>{pu.name}</option>)}
            </select>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-green-800 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterWardId, setFilterWardId] = useState("");
  const [filterPollingUnitId, setFilterPollingUnitId] = useState("");
  const [page, setPage] = useState(1);
  const [wards, setWards] = useState<Ward[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [previewMember, setPreviewMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const limit = 20;

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (filterWardId) params.set("wardId", filterWardId);
    if (filterPollingUnitId) params.set("pollingUnitId", filterPollingUnitId);
    fetch(`/api/members?${params}`).then((r) => r.json()).then((data) => {
      setMembers(data.members);
      setTotal(data.total);
    });
  }, [page, search, filterWardId, filterPollingUnitId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch("/api/wards").then((r) => r.json()).then(setWards);
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const filterWard = wards.find((w) => w.id === filterWardId);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    load();
  };

  const buildCardData = (m: Member): IDCardData => ({
    memberId: m.memberId, name: m.name, photoUrl: m.photoUrl,
    dob: m.dob, issueDate: m.issueDate, expiryDate: m.expiryDate,
    ward: m.ward.name, pollingUnit: m.pollingUnit.name,
    cardTitle: settings.cardTitle, cardSubtitle: settings.cardSubtitle,
    state: settings.state, lga: settings.lga,
    chairmanTitle: settings.chairmanTitle, chairmanName: settings.chairmanName,
    secretaryTitle: settings.secretaryTitle, secretaryName: settings.secretaryName,
    footerText: settings.footerText, logoUrl: settings.logoUrl,
  });

  const downloadAllPDF = async () => {
    setBulkLoading(true);
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;
    const { CARD_WIDTH, CARD_HEIGHT } = await import("@/components/IDCard");

    const params = new URLSearchParams({ limit: "10000" });
    if (filterWardId) params.set("wardId", filterWardId);
    if (filterPollingUnitId) params.set("pollingUnitId", filterPollingUnitId);
    if (search) params.set("search", search);

    const allData = await fetch(`/api/members?${params}`).then((r) => r.json());
    const allMembers: Member[] = allData.members;

    const container = hiddenRef.current;
    if (!container || allMembers.length === 0) { setBulkLoading(false); return; }

    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [CARD_WIDTH, CARD_HEIGHT] });

    for (let i = 0; i < allMembers.length; i++) {
      const m = allMembers[i];

      // Render front
      container.innerHTML = "";
      const divF = document.createElement("div");
      container.appendChild(divF);
      const { createRoot } = await import("react-dom/client");
      const { createElement } = await import("react");
      const IDCardComp = (await import("@/components/IDCard")).default;

      const rootF = createRoot(divF);
      rootF.render(createElement(IDCardComp, { data: buildCardData(m), side: "front", forExport: true }));
      await new Promise((r) => setTimeout(r, 250));
      const canvasFront = await html2canvas(divF.firstElementChild as HTMLElement, { scale: 3, useCORS: true, backgroundColor: null });
      rootF.unmount();

      // Render back
      const divB = document.createElement("div");
      container.appendChild(divB);
      const rootB = createRoot(divB);
      rootB.render(createElement(IDCardComp, { data: buildCardData(m), side: "back", forExport: true }));
      await new Promise((r) => setTimeout(r, 250));
      const canvasBack = await html2canvas(divB.firstElementChild as HTMLElement, { scale: 3, useCORS: true, backgroundColor: null });
      rootB.unmount();

      if (i > 0) pdf.addPage([CARD_WIDTH, CARD_HEIGHT], "portrait");
      pdf.addImage(canvasFront.toDataURL("image/png"), "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT);
      pdf.addPage([CARD_WIDTH, CARD_HEIGHT], "portrait");
      pdf.addImage(canvasBack.toDataURL("image/png"), "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT);
    }

    const suffix = filterWardId ? `-${filterWard?.name || "ward"}` : "-all";
    pdf.save(`gidan-amana-members${suffix}.pdf`);
    container.innerHTML = "";
    setBulkLoading(false);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <AuthGuard>
      {/* Hidden container for PDF rendering */}
      <div ref={hiddenRef} style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }} />

      {/* Preview Modal */}
      {previewMember && (
        <PreviewModal member={previewMember} settings={settings} onClose={() => setPreviewMember(null)} />
      )}

      {/* Edit Modal */}
      {editMember && (
        <EditModal member={editMember} wards={wards} onClose={() => setEditMember(null)} onSaved={load} />
      )}

      <div className="p-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-green-900">Members <span className="text-base font-normal text-gray-400">({total.toLocaleString()})</span></h1>
            <button
              onClick={downloadAllPDF}
              disabled={bulkLoading || total === 0}
              className="bg-green-800 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {bulkLoading ? (
                <><span className="animate-spin">⏳</span> Generating PDF...</>
              ) : (
                <>⬇ Download {filterWardId || filterPollingUnitId || search ? "Filtered" : "All"} as PDF</>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 w-56"
            />
            <select
              value={filterWardId}
              onChange={(e) => { setFilterWardId(e.target.value); setFilterPollingUnitId(""); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">All Wards</option>
              {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <select
              value={filterPollingUnitId}
              onChange={(e) => { setFilterPollingUnitId(e.target.value); setPage(1); }}
              disabled={!filterWardId}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
            >
              <option value="">All Polling Units</option>
              {filterWard?.pollingUnits.map((pu) => <option key={pu.id} value={pu.id}>{pu.name}</option>)}
            </select>
            {(filterWardId || filterPollingUnitId || search) && (
              <button
                onClick={() => { setSearch(""); setFilterWardId(""); setFilterPollingUnitId(""); setPage(1); }}
                className="text-sm text-gray-500 hover:text-red-600 font-medium px-2"
              >
                ✕ Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Photo</th>
                <th className="px-4 py-3 text-left">Member ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Ward</th>
                <th className="px-4 py-3 text-left">Polling Unit</th>
                <th className="px-4 py-3 text-left">DOB</th>
                <th className="px-4 py-3 text-left">Registered</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-9 h-9 rounded-full border-2 border-green-700 overflow-hidden bg-green-50 flex items-center justify-center">
                      {m.photoUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-green-600 text-sm font-bold">{m.name.charAt(0)}</span>
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-green-700 text-xs">{m.memberId}</td>
                  <td className="px-4 py-3 font-semibold">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.ward.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.pollingUnit.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.dob}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setPreviewMember(m)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Preview</button>
                      <button onClick={() => setEditMember(m)} className="text-green-700 hover:text-green-900 font-medium text-xs">Edit</button>
                      <button onClick={() => handleDelete(m.id, m.name)} className="text-red-500 hover:text-red-700 font-medium text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No members found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 mt-4 justify-end items-center">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">← Prev</button>
            <span className="px-3 py-1 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">Next →</button>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
