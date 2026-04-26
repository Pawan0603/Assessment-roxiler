"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import { useDB, api } from "@/lib/store";

import { validateAddress, validateEmail, validateName } from "@/lib/validations";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SortableTh } from "@/components/SortableTh";

import { Plus, Search, Star } from "lucide-react";
import { toast } from "sonner";

type SortField = "name" | "email" | "address" | "rating";

export default function AdminStoresPage() {
  const { user } = useAuth();
  const db = useDB();
  const router = useRouter();

  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fAddress, setFAddress] = useState("");

  const [sort, setSort] = useState<{ field: SortField; dir: "asc" | "desc" }>({
    field: "name",
    dir: "asc",
  });

  const [open, setOpen] = useState(false);

  // 🔥 Auth protection
  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/");
  }, [user, router]);

  const rows = useMemo(() => {
    let list = db.stores
      .filter(
        (s) =>
          s.name.toLowerCase().includes(fName.toLowerCase()) &&
          s.email.toLowerCase().includes(fEmail.toLowerCase()) &&
          s.address.toLowerCase().includes(fAddress.toLowerCase())
      )
      .map((s) => ({ ...s, avg: api.storeAverage(s.id) }));

    list = [...list].sort((a, b) => {
      if (sort.field === "rating") {
        return sort.dir === "asc" ? a.avg - b.avg : b.avg - a.avg;
      }
      const av = a[sort.field].toLowerCase();
      const bv = b[sort.field].toLowerCase();
      return sort.dir === "asc"
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });

    return list;
  }, [db.stores, db.ratings, fName, fEmail, fAddress, sort]);

  if (!user || user.role !== "admin") return null;

  const onSort = (f: SortField) =>
    setSort((s) => ({
      field: f,
      dir: s.field === f && s.dir === "asc" ? "desc" : "asc",
    }));

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all registered stores
          </p>
        </div>

        <AddStoreDialog open={open} setOpen={setOpen} />
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name"
                className="pl-8"
                value={fName}
                onChange={(e) => setFName(e.target.value)}
              />
            </div>

            <Input
              placeholder="Email"
              value={fEmail}
              onChange={(e) => setFEmail(e.target.value)}
            />

            <Input
              placeholder="Address"
              value={fAddress}
              onChange={(e) => setFAddress(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <SortableTh field="name" label="Name" sort={sort} onSort={onSort} />
                <SortableTh field="email" label="Email" sort={sort} onSort={onSort} />
                <SortableTh field="address" label="Address" sort={sort} onSort={onSort} />
                <SortableTh field="rating" label="Rating" sort={sort} onSort={onSort} />
              </tr>
            </thead>

            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium">{s.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{s.email}</td>
                  <td className="px-3 py-3 text-muted-foreground">{s.address}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {s.avg.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                    No stores found
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

/* ---------------- Dialog ---------------- */

function AddStoreDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const db = useDB();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [ownerId, setOwnerId] = useState<string>("none");

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const owners = db.users.filter((u) => u.role === "owner");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const errs = {
      name: validateName(name),
      email: validateEmail(email),
      address: validateAddress(address),
    };

    setErrors(errs);

    if (Object.values(errs).some(Boolean)) return;

    api.addStore({
      name,
      email,
      address,
      ownerId: ownerId === "none" ? undefined : ownerId,
    });

    toast.success("Store created");

    setOpen(false);
    setName("");
    setEmail("");
    setAddress("");
    setOwnerId("none");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Add Store
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div>
            <Label>Address</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div>
            <Label>Owner (optional)</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No owner</SelectItem>
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Create Store
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}