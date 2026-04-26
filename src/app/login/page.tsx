"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { api } from "@/lib/store";
import { validateEmail } from "@/lib/validations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isSubmiting, setIsSubmiting] = useState<boolean>(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmiting(true);

    const ee = validateEmail(email);
    if (ee) return setErr(ee);

    if (!password) return setErr("Password is required");

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const u = res.data.user;
      localStorage.setItem("user", JSON.stringify(u));
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      refresh();
      if (u.role === "admin") router.push("/admin");
      else if (u.role === "owner") router.push("/owner");
      else router.push("/stores");
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setIsSubmiting(false);
    }


  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="flex flex-col gap-2 my-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2 my-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {err && <p className="text-sm text-destructive">{err}</p>}

            <Button type="submit" className="w-full hover:cursor-pointer" disabled={isSubmiting}>
              {isSubmiting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline hover:cursor-pointer">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}