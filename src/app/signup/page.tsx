"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// import { api } from "@/lib/store";
import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validations";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = {
      name: validateName(name),
      email: validateEmail(email),
      address: validateAddress(address),
      password: validatePassword(password),
    };

    setErrors(errs);

    if (Object.values(errs).some(Boolean)) return;

    try {
      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        address,
        password,
      });

      router.push("/stores");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign up as a Normal User
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                {name.length}/60 — must be 20-60 characters
              </p>

              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                {address.length}/400
              </p>

              {errors.address && (
                <p className="text-sm text-destructive">
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                8-16 chars, 1 uppercase, 1 special character
              </p>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}