"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/store";
import { validatePassword } from "@/lib/validations";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";

export default function PasswordPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // 🔥 Auth protection
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const ve = validatePassword(next);
    if (ve) return setErr(ve);

    if (next !== confirm) return setErr("Passwords do not match");

    try {
      api.updatePassword(user.id, current, next);

      toast.success("Password updated");

      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <AppLayout>
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                8-16 chars, 1 uppercase, 1 special character
              </p>
            </div>

            <div>
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            {err && (
              <p className="text-sm text-destructive">{err}</p>
            )}

            <Button type="submit" className="w-full">
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}