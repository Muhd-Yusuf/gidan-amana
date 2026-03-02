"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";

interface Ward {
  id: string;
  name: string;
  pollingUnits: { id: string; name: string }[];
  _count?: { members: number };
}

export default function WardsPage() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [newWard, setNewWard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/wards").then((r) => r.json()).then(setWards);

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newWard.trim()) return;
    setLoading(true);
    const res = await fetch("/api/wards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWard.trim() }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add ward");
      return;
    }
    setNewWard("");
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ward "${name}"? This will fail if it has polling units or members.`)) return;
    const res = await fetch(`/api/wards/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Cannot delete — ward has linked polling units or members.");
      return;
    }
    load();
  };

  return (
    <AuthGuard>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-green-900 mb-6">Manage Wards</h1>

        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Ward name..."
            value={newWard}
            onChange={(e) => setNewWard(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-800 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Add Ward
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {wards.length === 0 ? (
            <p className="p-6 text-center text-gray-400">No wards added yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-green-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Ward Name</th>
                  <th className="px-4 py-3 text-left">Polling Units</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((w) => (
                  <tr key={w.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold">{w.name}</td>
                    <td className="px-4 py-3 text-gray-500">{w.pollingUnits.length}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(w.id, w.name)}
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
