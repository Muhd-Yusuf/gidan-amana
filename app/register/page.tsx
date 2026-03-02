"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { IDCardData } from "@/components/IDCard";

const IDCard = dynamic(() => import("@/components/IDCard"), { ssr: false });
const IDCardModule = () => import("@/components/IDCard");

interface Ward {
  id: string;
  name: string;
  pollingUnits: { id: string; name: string }[];
}

interface Member {
  id: string;
  memberId: string;
  name: string;
  photoUrl?: string;
  dob: string;
  issueDate: string;
  expiryDate: string;
  ward: { name: string };
  pollingUnit: { name: string };
}

export default function RegisterPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    dob: "",
    wardId: "",
    pollingUnitId: "",
    photoBase64: "",
    photoPreview: "",
  });
  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [error, setError] = useState("");
  const cardFrontRef = useRef<HTMLDivElement>(null);
  const cardBackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/wards").then((r) => r.json()).then(setWards);
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const selectedWard = wards.find((w) => w.id === form.wardId);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setForm((f) => ({ ...f, photoBase64: base64, photoPreview: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          dob: form.dob,
          wardId: form.wardId,
          pollingUnitId: form.pollingUnitId,
          photoBase64: form.photoBase64 || undefined,
          issueDate: settings.issueDate || new Date().toISOString().slice(0, 10),
          expiryDate: settings.expiryDate || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }
      const data = await res.json();
      setMember(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = useCallback(async () => {
    if (!cardFrontRef.current || !cardBackRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const { CARD_WIDTH, CARD_HEIGHT } = await IDCardModule();

    const canvasFront = await html2canvas(cardFrontRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });
    const canvasBack = await html2canvas(cardBackRef.current, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [CARD_WIDTH, CARD_HEIGHT] });
    pdf.addImage(canvasFront.toDataURL("image/png"), "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT);
    pdf.addPage([CARD_WIDTH, CARD_HEIGHT], "portrait");
    pdf.addImage(canvasBack.toDataURL("image/png"), "PNG", 0, 0, CARD_WIDTH, CARD_HEIGHT);
    pdf.save(`${member?.memberId}.pdf`);
  }, [member]);

  if (member) {
    const cardData: IDCardData = {
      memberId: member.memberId,
      name: member.name,
      photoUrl: member.photoUrl,
      dob: member.dob,
      issueDate: member.issueDate,
      expiryDate: member.expiryDate,
      ward: member.ward.name,
      pollingUnit: member.pollingUnit.name,
      cardTitle: settings.cardTitle,
      cardSubtitle: settings.cardSubtitle,
      state: settings.state,
      lga: settings.lga,
      chairmanTitle: settings.chairmanTitle,
      chairmanName: settings.chairmanName,
      secretaryTitle: settings.secretaryTitle,
      secretaryName: settings.secretaryName,
      footerText: settings.footerText,
      logoUrl: settings.logoUrl,
    };

    return (
      <main className="min-h-screen bg-green-950 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-yellow-400 font-black text-3xl tracking-widest mb-1">GIDAN AMANA</div>
          <div className="text-green-300 text-sm tracking-widest">Registration Successful</div>
        </div>

        <div className="bg-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 backdrop-blur">
          <p className="text-green-100 text-center">
            Welcome, <strong className="text-yellow-400">{member.name}</strong>!<br />
            Your Member ID is{" "}
            <strong className="text-yellow-400 font-mono">{member.memberId}</strong>
          </p>

          {/* Front & Back Card Display */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="text-center">
              <div className="text-green-300 text-xs mb-2 tracking-widest uppercase">Front</div>
              <IDCard ref={cardFrontRef} data={cardData} side="front" forExport />
            </div>
            <div className="text-center">
              <div className="text-green-300 text-xs mb-2 tracking-widest uppercase">Back</div>
              <IDCard ref={cardBackRef} data={cardData} side="back" forExport />
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-8 py-3 rounded-lg transition-colors w-full max-w-md"
          >
            Download ID Card (PDF)
          </button>
          <button
            onClick={() => { setMember(null); setForm({ name: "", dob: "", wardId: "", pollingUnitId: "", photoBase64: "", photoPreview: "" }); }}
            className="text-green-300 hover:text-white text-sm transition-colors"
          >
            Register Another Member
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-yellow-400 font-black text-3xl tracking-widest mb-1">GIDAN AMANA</div>
          <div className="text-green-300 text-sm tracking-widest">Member Registration</div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col gap-4"
        >
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full border-4 border-green-800 overflow-hidden bg-green-50 flex items-center justify-center">
              {form.photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-green-300 text-4xl">📷</span>
              )}
            </div>
            <label className="cursor-pointer bg-green-800 text-white text-xs px-4 py-1.5 rounded-full hover:bg-green-700 transition-colors">
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth *</label>
            <input
              required
              type="date"
              value={form.dob}
              onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ward *</label>
            <select
              required
              value={form.wardId}
              onChange={(e) => setForm((f) => ({ ...f, wardId: e.target.value, pollingUnitId: "" }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select Ward</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Polling Unit *</label>
            <select
              required
              value={form.pollingUnitId}
              onChange={(e) => setForm((f) => ({ ...f, pollingUnitId: e.target.value }))}
              disabled={!form.wardId}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
            >
              <option value="">Select Polling Unit</option>
              {selectedWard?.pollingUnits.map((pu) => (
                <option key={pu.id} value={pu.id}>{pu.name}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-800 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register & Get ID Card"}
          </button>
        </form>
      </div>
    </main>
  );
}
