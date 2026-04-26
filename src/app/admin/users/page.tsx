"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/store";

import {
  validateAddress,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validations";

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

import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

type SortField = "name" | "email" | "address" | "role";

// ✅ SAME SHAPE AS OLD db.users (IMPORTANT for UI not breaking)
type User = {
  id: string;
  name: string;
  email: string;
  address: string;
  role: Role;
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  // ❌ old: const db = useDB();
  const [dbUsers, setDbUsers] = useState<User[]>([]);
  const [dbStores, setDbStores] = useState<any[]>([]);

  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");

  const [sort, setSort] = useState<{ field: SortField; dir: "asc" | "desc" }>({
    field: "name",
    dir: "asc",
  });

  const [open, setOpen] = useState(false);

  // 🔐 protect route
  useEffect(() => {
    if (!user) router.push("/login");
    else if (user.role !== "admin") router.push("/");
  }, [user, router]);

  // 🔥 FETCH USERS (mapped to old shape)
  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({
        search: filterName,
        role: filterRole,
      });

      const res = await fetch(`/api/users?${query.toString()}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // 🔥 map _id → id (so UI same rahe)
      const mapped = data.users.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
      }));

      setDbUsers(mapped);
    } catch (e: any) {
      toast.error(e.message || "Failed to fetch users");
    }
  };

  // optional: stores (for rating calc future)
  const fetchStores = async () => {
    try {
      const res = await fetch("/api/stores", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setDbStores(data);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, [filterName, filterRole]);

  // 🔥 SAME LOGIC AS YOUR ORIGINAL (NO CHANGE)
  const rows = useMemo(() => {
    let r = dbUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(filterName.toLowerCase()) &&
        u.email.toLowerCase().includes(filterEmail.toLowerCase()) &&
        u.address.toLowerCase().includes(filterAddress.toLowerCase()) &&
        (filterRole === "all" || u.role === filterRole)
    );

    r = [...r].sort((a, b) => {
      const av = a[sort.field].toLowerCase();
      const bv = b[sort.field].toLowerCase();
      return sort.dir === "asc"
        ? av.localeCompare(bv)
        : bv.localeCompare(av);
    });

    return r;
  }, [dbUsers, filterName, filterEmail, filterAddress, filterRole, sort]);

  if (!user || user.role !== "admin") return null;

  const onSort = (f: SortField) =>
    setSort((s) => ({
      field: f,
      dir: s.field === f && s.dir === "asc" ? "desc" : "asc",
    }));

  return (
    <AppLayout>
      {/* 🔴 UI SAME — NOTHING CHANGED BELOW */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all platform users
          </p>
        </div>

        <AddUserDialog open={open} setOpen={setOpen} refresh={fetchUsers} />
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Name"
                className="pl-8"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>

            <Input
              placeholder="Email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />

            <Input
              placeholder="Address"
              value={filterAddress}
              onChange={(e) => setFilterAddress(e.target.value)}
            />

            <Select
              value={filterRole}
              onValueChange={(v) => setFilterRole(v as Role | "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Normal User</SelectItem>
                <SelectItem value="owner">Store Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <SortableTh field="name" label="Name" sort={sort} onSort={onSort} />
                <SortableTh field="email" label="Email" sort={sort} onSort={onSort} />
                <SortableTh field="address" label="Address" sort={sort} onSort={onSort} />
                <SortableTh field="role" label="Role" sort={sort} onSort={onSort} />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Rating
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-3 font-medium">{u.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-3 py-3 text-muted-foreground">{u.address}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">—</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                    No users found
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

function AddUserDialog({ open, setOpen, refresh }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");

  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const [isSubmiting, setIsSubmiting] = useState<boolean>(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmiting(true);
    const errs = {
      name: validateName(name),
      email: validateEmail(email),
      address: validateAddress(address),
      password: validatePassword(password),
    };

    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ name, email, address, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("User created");

      refresh();
      setOpen(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3">
          <div className="flex flex-col gap-2 my-3">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-2 my-3">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-2 my-3">
            <Label>Address</Label>
            <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="flex flex-col gap-2 my-3">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="flex flex-col gap-2 my-3">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">Normal User</SelectItem>
                <SelectItem value="owner">Store Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmiting}>
            {isSubmiting ? "Creating User..." : "Create User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}