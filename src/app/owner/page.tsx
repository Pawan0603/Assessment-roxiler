"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { useDB, api } from "@/lib/store";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";

import { Star, Users } from "lucide-react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const db = useDB();
  const router = useRouter();

  // 🔥 Auth + role protection
  // useEffect(() => {
  //   if (!user) router.push("/login");
  //   else if (user.role !== "owner") router.push("/");
  // }, [user, router]);

  if (!user || user.role !== "owner") return null;

  const stores = db.stores.filter((s) => s.ownerId === user.id);
  const raters = api.ratersForOwner(user.id);

  const overallAvg = stores.length
    ? stores.reduce((acc, s) => acc + api.storeAverage(s.id), 0) /
      stores.length
    : 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome, {user.name.split(" ")[0]}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Your Stores
            </p>
            <p className="mt-2 text-4xl font-bold">{stores.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Total Ratings
            </p>
            <p className="mt-2 text-4xl font-bold">{raters.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">
              Average Rating
            </p>

            <div className="mt-2 flex items-center gap-3">
              <p className="text-4xl font-bold">
                {overallAvg.toFixed(2)}
              </p>
              <StarRating
                value={Math.round(overallAvg)}
                readOnly
                size={18}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores */}
      <h2 className="mt-8 mb-3 text-xl font-semibold">
        Your Stores
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {stores.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5">
              <h3 className="font-semibold">{s.name}</h3>

              <p className="text-sm text-muted-foreground">
                {s.address}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

                <span className="font-medium">
                  {api.storeAverage(s.id).toFixed(2)}
                </span>

                <span className="text-sm text-muted-foreground">
                  (
                  {
                    db.ratings.filter(
                      (r) => r.storeId === s.id
                    ).length
                  }{" "}
                  ratings)
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {stores.length === 0 && (
          <p className="text-muted-foreground">
            No stores assigned to you yet.
          </p>
        )}
      </div>

      {/* Ratings Table */}
      <h2 className="mt-8 mb-3 flex items-center gap-2 text-xl font-semibold">
        <Users className="h-5 w-5" /> Ratings From Users
      </h2>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  User
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Store
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rating
                </th>
              </tr>
            </thead>

            <tbody>
              {raters.map(({ rating, user: u, store }) => (
                <tr key={rating.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">
                    {u?.name ?? "—"}
                  </td>

                  <td className="px-3 py-3 text-muted-foreground">
                    {u?.email ?? "—"}
                  </td>

                  <td className="px-3 py-3 text-muted-foreground">
                    {store?.name ?? "—"}
                  </td>

                  <td className="px-3 py-3">
                    <StarRating
                      value={rating.value}
                      readOnly
                      size={16}
                    />
                  </td>
                </tr>
              ))}

              {raters.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-8 text-center text-muted-foreground"
                  >
                    No ratings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}