"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/StarRating";

import { Search, Star, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function StoresPage() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔥 mimic db.stores
  const [dbStores, setDbStores] = useState<any[]>([]);
  const [q, setQ] = useState("");

  // 🔐 redirect
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // 🔥 FETCH STORES
  const fetchStores = async () => {
    try {
      const res = await fetch("/api/stores", {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 🔥 map → same UI structure
      const mapped = data.stores.map((s: any) => ({
        id: s._id,
        name: s.name,
        address: s.address,
        avg: s.avgRating,
        mine: s.myRating || 0, // 🔥 backend should send this
      }));

      setDbStores(mapped);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // 🔥 SAME FILTER LOGIC
  const stores = useMemo(() => {
    return dbStores.filter(
      (s) =>
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.address.toLowerCase().includes(q.toLowerCase())
    );
  }, [dbStores, q]);

  if (!user) return null;

  // 🔥 RATE STORE
  const handleRate = async (storeId: string, value: number) => {
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ storeId, value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Rated ${value} star${value > 1 ? "s" : ""}`);

      fetchStores(); // 🔥 refresh
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Stores</h1>
        <p className="mt-1 text-muted-foreground">
          Discover and rate stores you love
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or address..."
          className="pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => {
          const avg = s.avg;
          const mine = s.mine;

          return (
            <Card key={s.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight">{s.name}</h3>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-200">
                    <Star className="h-3 w-3 fill-current" />
                    {avg.toFixed(1)}
                  </span>
                </div>

                <p className="mt-2 flex items-start gap-1 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="line-clamp-2">{s.address}</span>
                </p>

                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {mine ? "Your rating" : "Rate this store"}
                  </p>

                  <div className="flex items-center justify-between">
                    <StarRating
                      value={mine ?? 0}
                      onChange={(v) => handleRate(s.id, v)}
                    />

                    {mine && (
                      <span className="text-xs text-muted-foreground">
                        Tap to modify
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {stores.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No stores match your search.
          </p>
        )}
      </div>
    </AppLayout>
  );
}