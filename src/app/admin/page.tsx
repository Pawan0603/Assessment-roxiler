"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { useDB } from "@/lib/store";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

import { Users, Store, Star } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const db = useDB();
  const router = useRouter();

  // 🔥 Auth + Role protection
  // useEffect(() => {
  //   if (!user) router.push("/login");
  //   else if (user.role !== "admin") router.push("/");
  // }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const totalUsers = db.users.length;
  const totalStores = db.stores.length;
  const totalRatings = db.ratings.length;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Total Stores",
      value: totalStores,
      icon: Store,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      label: "Total Ratings",
      value: totalRatings,
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
              {db.stores
                .slice(-5)
                .reverse()
                .map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-md border p-2 text-sm"
                  >
                    <span className="truncate">{s.name}</span>

                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {/* {api.storeAverage(s.id).toFixed(1)} */} tepx placeholder
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
              {db.users
                .slice(-5)
                .reverse()
                .map((u) => (
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