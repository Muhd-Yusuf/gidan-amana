"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";

interface Ward {
  id: string;
  name: string;
}

interface PollingUnit {
  id: string;
  name: string;
  ward: { id: string; name: string };
}

export default function PollingUnitsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [units, setUnits] = useState<PollingUnit[]>([]);
  const [form, setForm] = useState({ name: "", wardId: "" });
  const [filterWard, setFilterWard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUnits = (wardId?: string) => {
    const url = wardId ? `/api/polling-units?wardId=${wardId}` : "/api/polling-units";
    fetch(url).then((r) => r.json()).then(setUnits);
  };

  useEffect(() => {
    fetch("/api/wards").then((r) => r.json()).then(setWards);
    loadUnits();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.wardId) return;
    setLoading(true);
    const res = await fetch("/api/polling-units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name.trim(), wardId: form.wardId }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add polling unit");
      return;
    }
    setForm({ name: "", wardId: "" });
    loadUnits(filterWard || undefined);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete polling unit "${name}"?`)) return;
    await fetch(`/api/polling-units/${id}`, { method: "DELETE" });
    loadUnits(filterWard || undefined);
  };

  return (
    <AuthGuard>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-green-900 mb-6">Manage Polling Units</h1>

        <form onSubmit={handleAdd} className="flex gap-3 mb-6 flex-wrap">
          <select
            required
            value={form.wardId}
            onChange={(e) => setForm((f) => ({ ...f, wardId: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">Select Ward</option>
            {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Polling unit name..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-800 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {/* Filter */}
        <div className="flex gap-3 mb-4">
          <select
            value={filterWard}
            onChange={(e) => { setFilterWard(e.target.value); loadUnits(e.target.value || undefined); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All Wards</option>
            {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {units.length === 0 ? (
            <p className="p-6 text-center text-gray-400">No polling units found</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-green-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Polling Unit</th>
                  <th className="px-4 py-3 text-left">Ward</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.ward.name}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
