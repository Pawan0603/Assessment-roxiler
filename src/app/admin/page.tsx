"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

import { Users, Store, Star } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔥 NEW STATE (same structure as db)
  const [db, setDb] = useState({
    users: [] as any[],
    stores: [] as any[],
    ratings: [] as any[],
  });

  // 🔐 Auth protection
  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/");
  }, [user, router]);

  // 🔥 FETCH DASHBOARD DATA
  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 🔥 map API → old db structure
      setDb({
        users: data.recentUsers.map((u: any, i: number) => ({
          id: i,
          name: u.name,
          role: u.role,
        })),
        stores: data.recentStores.map((s: any) => ({
          id: s.id,
          name: s.name,
          avg: s.avgRating,
        })),
        ratings: Array(data.stats.totalRatings).fill({}), // just for count
      });

      // also override counts
      setStats({
        totalUsers: data.stats.totalUsers,
        totalStores: data.stats.totalStores,
        totalRatings: data.stats.totalRatings,
      });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // 🔥 stats state (same UI)
  const [statsState, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!user || user.role !== "admin") return null;

  const stats = [
    {
      label: "Total Users",
      value: statsState.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Stores",
      value: statsState.totalStores,
      icon: Store,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Ratings",
      value: statsState.totalRatings,
      icon: Star,
      color: "from-amber-500 to-amber-600",
    },
  ];

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2 text-4xl font-bold">{s.value}</p>
                </div>

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg`}
                >
                  <s.icon className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {/* Recent Stores */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold">Recent Stores</h3>

            <ul className="mt-3 space-y-2">
              {db.stores.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <span className="truncate">{s.name}</span>

                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {s.avg?.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold">Recent Users</h3>

            <ul className="mt-3 space-y-2">
              {db.users.slice(0, 5).map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between rounded-md border p-2 text-sm"
                >
                  <span className="truncate">{u.name}</span>

                  <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs">
                    {u.role}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}