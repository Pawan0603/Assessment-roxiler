"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/AppLayout";

import { Card, CardContent } from "@/components/ui/card";
import { Store, Users, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔥 Role-based redirect (replace Navigate)
  useEffect(() => {
    if (user?.role === "admin") router.push("/admin");
    else if (user?.role === "user") router.push("/stores");
    else if (user?.role === "owner") router.push("/owner");
  }, [user, router]);

  return (
    <AppLayout>
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-accent p-8 sm:p-12 md:p-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            Trusted ratings, real stores
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Rate the stores you love.
          </h1>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            A unified platform where customers, store owners, and administrators come together to
            build a transparent rating community.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => router.push("/signup")}>
              Get started
            </Button>

            <Button size="lg" variant="outline" onClick={() => router.push("/login")}>
              Login
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, title: "For Customers", text: "Discover and rate stores in your area." },
          { icon: Store, title: "For Store Owners", text: "Track ratings and customer feedback." },
          { icon: ShieldCheck, title: "For Admins", text: "Manage users and stores at scale." },
        ].map((f) => (
          <Card key={f.title}>
            <CardContent className="p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="font-semibold">Try the demo</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Use one of these accounts to explore each role:
          </p>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-md border bg-muted/50 p-3">
              <div className="font-medium">Admin</div>
              <div className="text-muted-foreground">admin@example.com</div>
              <div className="text-muted-foreground">Admin@123</div>
            </div>

            <div className="rounded-md border bg-muted/50 p-3">
              <div className="font-medium">Normal User</div>
              <div className="text-muted-foreground">user@example.com</div>
              <div className="text-muted-foreground">User@1234</div>
            </div>

            <div className="rounded-md border bg-muted/50 p-3">
              <div className="font-medium">Store Owner</div>
              <div className="text-muted-foreground">owner@example.com</div>
              <div className="text-muted-foreground">Owner@123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}