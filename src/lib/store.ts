"use client";

import { useSyncExternalStore } from "react";

export type Role = "admin" | "user" | "owner";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  role: Role;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId?: string;
}

export interface Rating {
  id: string;
  storeId: string;
  userId: string;
  value: number;
}

interface DB {
  users: User[];
  stores: Store[];
  ratings: Rating[];
  currentUserId: string | null;
}

const KEY = "store-rating-db-v1";

const seed = (): DB => ({
  users: [
    {
      id: "u-admin",
      name: "System Administrator Account One",
      email: "admin@example.com",
      password: "Admin@123",
      address: "1 Admin Plaza, HQ",
      role: "admin",
    },
    {
      id: "u-user",
      name: "Normal User Demo Account Holder",
      email: "user@example.com",
      password: "User@1234",
      address: "12 User Lane",
      role: "user",
    },
    {
      id: "u-owner",
      name: "Store Owner Demo Account Holder",
      email: "owner@example.com",
      password: "Owner@123",
      address: "99 Owner Road",
      role: "owner",
    },
  ],
  stores: [
    {
      id: "s-1",
      name: "Greenleaf Grocery Mart Downtown Branch",
      email: "contact@greenleaf.com",
      address: "45 Market Street, Downtown",
      ownerId: "u-owner",
    },
  ],
  ratings: [],
  currentUserId: null,
});

let db: DB = seed();

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) db = JSON.parse(raw);
    else localStorage.setItem(KEY, JSON.stringify(db));
  } catch {}
}

const listeners = new Set<() => void>();

const persist = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {}
  }
  listeners.forEach((l) => l());
};

export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export const api = {
  login(email: string, password: string): User | null {
    const u = db.users.find((u) => u.email === email && u.password === password);
    if (u) {
      db.currentUserId = u.id;
      persist();
      return u;
    }
    return null;
  },

  logout() {
    db.currentUserId = null;
    persist();
  },

  currentUser(): User | null {
    return db.users.find((u) => u.id === db.currentUserId) ?? null;
  },

  signup(input: Omit<User, "id" | "role">): User {
    if (db.users.some((u) => u.email === input.email)) {
      throw new Error("Email already registered");
    }
    const u: User = { ...input, id: uid("u"), role: "user" };
    db.users.push(u);
    db.currentUserId = u.id;
    persist();
    return u;
  },
};

export const useDB = () =>
  useSyncExternalStore(subscribe, () => db, () => db);