"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";

interface WardStat { id: string; name: string; memberCount: number; pollingUnitCount: number; }
interface Stats { totalMembers: number; totalWards: number; totalPollingUnits: number; wardBreakdown: WardStat[]; }
interface RecentMember { id: string; memberId: string; name: string; ward: { name: string }; createdAt: string; }
interface DailyStat { date: string; count: number; }

function StatCard({ label, value, accent, link, linkLabel }: {
  label: string; value: number; accent: string; link?: string; linkLabel?: string;
}) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow border-l-4 ${accent}`}>
      <div className="text-sm text-gray-500 mb-1 font-medium">{label}</div>
      <div className="text-4xl font-black text-green-900 mb-3">{value.toLocaleString()}</div>
      {link && (
        <Link href={link} className="text-xs text-green-700 hover:text-green-900 font-semibold underline underline-offset-2">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

function DailyChart({ data }: { data: DailyStat[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  // Show last 14 days labels
  const labeled = data.filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <div>
      <div className="flex items-end gap-1 h-24 mb-1">
        {data.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className="w-full bg-green-600 rounded-sm hover:bg-green-500 transition-colors"
              style={{ height: `${Math.max((d.count / max) * 88, d.count > 0 ? 4 : 1)}px` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
              {d.date.slice(5)}: {d.count}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        {labeled.map((d) => (
          <span key={d.date}>{d.date.slice(5)}</span>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        <span className="font-semibold text-green-700">{total}</span> registrations in the last 30 days
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalWards: 0, totalPollingUnits: 0, wardBreakdown: [] });
  const [recent, setRecent] = useState<RecentMember[]>([]);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/members?limit=10").then((r) => r.json()),
      fetch("/api/stats/daily").then((r) => r.json()),
    ]).then(([statsData, membersData, dailyData]) => {
      setStats(statsData);
      setRecent(membersData.members);
      setDaily(dailyData);
      setLoading(false);
    });
  }, []);

  return (
    <AuthGuard>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gidan Amana Movement — Overview</p>
          </div>
          <Link href="/register" target="_blank"
            className="bg-yellow-400 hover:bg-yellow-300 text-green-900 font-bold px-4 py-2 rounded-lg text-sm transition-colors">
            Open Registration Form ↗
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Total Members" value={stats.totalMembers} accent="border-green-700" link="/admin/members" linkLabel="View all members" />
          <StatCard label="Total Wards" value={stats.totalWards} accent="border-yellow-500" link="/admin/wards" linkLabel="Manage wards" />
          <StatCard label="Total Polling Units" value={stats.totalPollingUnits} accent="border-blue-500" link="/admin/polling-units" linkLabel="Manage polling units" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Daily registrations chart */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow p-6">
            <h2 className="text-base font-bold text-green-900 mb-4">Registrations — Last 30 Days</h2>
            {loading ? <p className="text-gray-400 text-sm">Loading...</p> : <DailyChart data={daily} />}
          </div>

          {/* Members by ward */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-green-900">By Ward</h2>
              <Link href="/admin/wards" className="text-xs text-green-700 hover:underline font-semibold">Manage →</Link>
            </div>
            {loading ? <p className="text-gray-400 text-sm">Loading...</p> :
              stats.wardBreakdown.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm mb-2">No wards yet</p>
                  <Link href="/admin/wards" className="bg-green-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">Add Wards</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.wardBreakdown.map((ward) => {
                    const pct = stats.totalMembers > 0 ? Math.round((ward.memberCount / stats.totalMembers) * 100) : 0;
                    return (
                      <div key={ward.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">{ward.name}</span>
                          <span className="text-xs font-bold text-green-700 ml-2">{ward.memberCount}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Registrations */}
          <div className="bg-white rounded-xl shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-green-900">Recent Registrations</h2>
              <Link href="/admin/members" className="text-xs text-green-700 hover:underline font-semibold">View all →</Link>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Member ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Ward</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                ) : recent.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No members yet</td></tr>
                ) : recent.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-green-700 text-xs">{m.memberId}</td>
                    <td className="px-6 py-3 font-semibold">{m.name}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{m.ward.name}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString("en-GB")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-base font-bold text-green-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: "/admin/members", icon: "👥", label: "View Members" },
                { href: "/admin/wards", icon: "🏘️", label: "Manage Wards" },
                { href: "/admin/polling-units", icon: "🗳️", label: "Polling Units" },
                { href: "/admin/settings", icon: "⚙️", label: "Card Settings" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors text-center">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
