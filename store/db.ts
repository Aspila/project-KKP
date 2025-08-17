/**
 * Database store and domain logic for Office Inventory (localStorage-based).
 * Provides types, initial seeding, and all CRUD/actions for items, users, loans, and requests.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { z } from "zod";

/** Role type for access control */
export type Role = "admin" | "user";

/** Item condition enum */
export type ItemCondition = "good" | "needs_repair" | "broken";

/** Basic User model */
export interface User {
  /** Unique id */
  id: string;
  /** Full name */
  name: string;
  /** Username for login */
  username: string;
  /** Plain password (demo only) */
  password: string;
  /** Role */
  role: Role;
  /** Email optional */
  email?: string;
  /** Avatar URL optional */
  avatarUrl?: string;
  /** Created at ISO string */
  createdAt: string;
}

/** Inventory item model */
export interface Item {
  id: string;
  name: string;
  code: string;
  category: string;
  location: string;
  condition: ItemCondition;
  quantity: number;
  available: number;
  image?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Loan model (peminjaman) */
export interface Loan {
  id: string;
  itemId: string;
  userId: string;
  qty: number;
  dateOut: string;
  dueDate?: string;
  dateIn?: string;
  status: "borrowed" | "returned";
}

/** Request model (permintaan peminjaman) */
export interface Request {
  id: string;
  itemId: string;
  userId: string;
  qty: number;
  note?: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

/** Audit log entry for admin tracking */
export interface Audit {
  id: string;
  action: string;
  userId?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

/** Root DB shape persisted in localStorage */
export interface DBState {
  users: User[];
  items: Item[];
  loans: Loan[];
  requests: Request[];
  audits: Audit[];
  categories: string[];
  locations: string[];
  /** Utility sequencer for human-friendly codes if needed */
  sequences: Record<string, number>;
}

/** Form validators using zod */
export const itemSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  category: z.string().min(1),
  location: z.string().min(1),
  condition: z.enum(["good", "needs_repair", "broken"]),
  quantity: z.number().int().min(0),
  available: z.number().int().min(0),
  image: z.string().url().optional().or(z.literal("")),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
});

export const userSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(3),
  role: z.enum(["admin", "user"]),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
});

export const requestSchema = z.object({
  itemId: z.string().min(1),
  userId: z.string().min(1),
  qty: z.number().int().min(1),
  note: z.string().optional(),
});

/** Utility to create unique IDs */
const uid = (prefix = "id"): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

/** Now ISO string helper */
const nowIso = () => new Date().toISOString();

/** Create initial seed data for demo and first run */
const createSeed = (): DBState => {
  const admin: User = {
    id: uid("usr"),
    name: "Administrator",
    username: "admin",
    password: "123456",
    role: "admin",
    email: "admin@example.com",
    createdAt: nowIso(),
    avatarUrl:
      "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/60993d29-9598-489c-aa21-7cb096f52206.jpg",
  };
  const staff: User = {
    id: uid("usr"),
    name: "Staff A",
    username: "staff",
    password: "123456",
    role: "user",
    email: "staff@example.com",
    createdAt: nowIso(),
    avatarUrl:
      "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/7fb8e5db-990e-42ec-9b95-d865ad47ae2f.jpg",
  };

  const categories = ["Laptop", "Monitor", "Furniture", "Stationery", "Networking"];
  const locations = ["Gudang A", "Gudang B", "Lantai 2", "Ruang Meeting"];
  const items: Item[] = [
    {
      id: uid("itm"),
      name: "Laptop Lenovo ThinkPad X1",
      code: "ITM-0001",
      category: "Laptop",
      location: "Gudang A",
      condition: "good",
      quantity: 10,
      available: 8,
      image:
        "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/bf900d06-4fd6-4490-a992-7008f3448332.jpg",
      purchaseDate: new Date().toISOString().slice(0, 10),
      notes: "Garansi 2 tahun",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: uid("itm"),
      name: 'Monitor Dell 24"',
      code: "ITM-0002",
      category: "Monitor",
      location: "Gudang B",
      condition: "good",
      quantity: 15,
      available: 15,
      image:
        "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/e2a53936-bca5-48e9-a621-2959ecdb3b50.jpg",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ];

  return {
    users: [admin, staff],
    items,
    loans: [],
    requests: [],
    audits: [],
    categories,
    locations,
    sequences: { item: 2 },
  };
};

/** Store interface with actions */
interface DBStore {
  db: DBState;
  /** Replace entire DB (with persistence) */
  setDB: (next: DBState) => void;

  // Users
  addUser: (data: z.infer<typeof userSchema>) => User;
  updateUser: (id: string, patch: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Items
  addItem: (data: z.infer<typeof itemSchema>) => Item;
  updateItem: (id: string, patch: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  // Requests
  createRequest: (data: z.infer<typeof requestSchema>) => Request;
  approveRequest: (id: string, adminId: string, dueDate?: string) => { request: Request; loan: Loan };
  declineRequest: (id: string, adminId: string) => Request;

  // Loans
  checkOut: (itemId: string, userId: string, qty: number, dueDate?: string) => Loan;
  checkIn: (loanId: string) => Loan;

  // Helpers
  nextCode: (prefix: string) => string;
}

/**
 * Create persisted Zustand store named 'office-inventory-db'
 * Includes all domain actions with simple optimistic updates.
 */
export const useDB = create<DBStore>()(
  persist(
    (set, get) => {
      /** Append an audit entry */
      const addAudit = (action: string, opts?: { userId?: string; targetId?: string; payload?: Record<string, unknown> }) => {
        const { db } = get();
        const audit: Audit = {
          id: uid("aud"),
          action,
          userId: opts?.userId,
          targetId: opts?.targetId,
          payload: opts?.payload,
          createdAt: nowIso(),
        };
        set({ db: { ...db, audits: [audit, ...db.audits].slice(0, 500) } }); // keep last 500
      };

      return {
        db: createSeed(),
        setDB: (next) => set({ db: next }),

        addUser: (data) => {
          const parsed = userSchema.parse(data);
          const user: User = {
            id: uid("usr"),
            name: parsed.name,
            username: parsed.username,
            password: parsed.password,
            role: parsed.role,
            email: parsed.email,
            avatarUrl:
              parsed.avatarUrl ??
              "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/a56d4ac6-9579-4f5a-99a2-9b461a349dc7.jpg",
            createdAt: nowIso(),
          };
          const { db } = get();
          const next: DBState = { ...db, users: [...db.users, user] };
          set({ db: next });
          addAudit("user.add", { targetId: user.id, payload: { username: user.username, role: user.role } });
          return user;
        },

        updateUser: (id, patch) => {
          const { db } = get();
          const users = db.users.map((u) => (u.id === id ? { ...u, ...patch } : u));
          set({ db: { ...db, users } });
          const safePatch = { ...patch };
          if (safePatch.password) safePatch.password = "***";
          addAudit("user.update", { targetId: id, payload: safePatch as Record<string, unknown> });
        },

        deleteUser: (id) => {
          const { db } = get();
          const users = db.users.filter((u) => u.id !== id);
          set({ db: { ...db, users } });
          addAudit("user.delete", { targetId: id });
        },

        addItem: (data) => {
          const parsed = itemSchema.parse(data);
          const item: Item = {
            id: uid("itm"),
            ...parsed,
            image:
              parsed.image && parsed.image.length > 0
                ? parsed.image
                : "https://pub-cdn.sider.ai/u/U024HZ4WEKZ/web-coder/68a20cc638697d89a1050142/resource/d54e3315-3165-48e0-8103-5c6474262730.jpg",
            createdAt: nowIso(),
            updatedAt: nowIso(),
          };
          const { db } = get();
          const next: DBState = { ...db, items: [...db.items, item] };
          set({ db: next });
          addAudit("item.add", { targetId: item.id, payload: { code: item.code, name: item.name } });
          return item;
        },

        updateItem: (id, patch) => {
          const { db } = get();
          const items = db.items.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: nowIso() } : i));
          set({ db: { ...db, items } });
          addAudit("item.update", { targetId: id, payload: patch as Record<string, unknown> });
        },

        deleteItem: (id) => {
          const { db } = get();
          const items = db.items.filter((i) => i.id !== id);
          // Also clean dependent records
          const loans = db.loans.filter((l) => l.itemId !== id);
          const requests = db.requests.filter((r) => r.itemId !== id);
          set({ db: { ...db, items, loans, requests } });
          addAudit("item.delete", { targetId: id });
        },

        createRequest: (data) => {
          const parsed = requestSchema.parse(data);
          const { db } = get();
          const item = db.items.find((i) => i.id === parsed.itemId);
          if (!item) throw new Error("Item tidak ditemukan");
          if (parsed.qty < 1) throw new Error("Jumlah minimal 1");
          if (parsed.qty > item.available) throw new Error("Stok tidak mencukupi");

          const req: Request = {
            id: uid("req"),
            itemId: parsed.itemId,
            userId: parsed.userId,
            qty: parsed.qty,
            note: parsed.note,
            status: "pending",
            createdAt: nowIso(),
          };
          const next: DBState = { ...db, requests: [req, ...db.requests] };
          set({ db: next });
          addAudit("request.create", {
            userId: parsed.userId,
            targetId: req.id,
            payload: { itemId: parsed.itemId, qty: parsed.qty },
          });
          return req;
        },

        approveRequest: (id, adminId, dueDate) => {
          const { db } = get();
          const req = db.requests.find((r) => r.id === id);
          if (!req) throw new Error("Permintaan tidak ditemukan");
          if (req.status !== "pending") throw new Error("Permintaan sudah diproses");
          const item = db.items.find((i) => i.id === req.itemId);
          if (!item) throw new Error("Item tidak ditemukan");
          if (req.qty > item.available) throw new Error("Stok tidak mencukupi");
          // Update item availability and create loan
          const loan: Loan = {
            id: uid("lon"),
            itemId: req.itemId,
            userId: req.userId,
            qty: req.qty,
            dateOut: nowIso(),
            dueDate,
            status: "borrowed",
          };
          const items = db.items.map((i) =>
            i.id === item.id ? { ...i, available: i.available - req.qty, updatedAt: nowIso() } : i
          );
          const requests = db.requests.map((r) =>
            r.id === id
              ? { ...r, status: "approved", processedAt: nowIso(), processedBy: adminId }
              : r
          );
          const loans = [loan, ...db.loans];

          set({ db: { ...db, items, requests, loans } });
          addAudit("request.approve", {
            userId: adminId,
            targetId: id,
            payload: { loanId: loan.id, dueDate },
          });
          addAudit("loan.checkOut", {
            userId: req.userId,
            targetId: loan.id,
            payload: { itemId: loan.itemId, qty: loan.qty },
          });
          return { request: requests.find((r) => r.id === id)!, loan };
        },

        declineRequest: (id, adminId) => {
          const { db } = get();
          const req = db.requests.find((r) => r.id === id);
          if (!req) throw new Error("Permintaan tidak ditemukan");
          if (req.status !== "pending") throw new Error("Permintaan sudah diproses");
          const requests = db.requests.map((r) =>
            r.id === id ? { ...r, status: "declined", processedAt: nowIso(), processedBy: adminId } : r
          );
          set({ db: { ...db, requests } });
          addAudit("request.decline", { userId: adminId, targetId: id });
          return requests.find((r) => r.id === id)!;
        },

        checkOut: (itemId, userId, qty, dueDate) => {
          const { db } = get();
          const item = db.items.find((i) => i.id === itemId);
          if (!item) throw new Error("Item tidak ditemukan");
          if (qty < 1) throw new Error("Jumlah minimal 1");
          if (qty > item.available) throw new Error("Stok tidak mencukupi");
          const loan: Loan = {
            id: uid("lon"),
            itemId,
            userId,
            qty,
            dateOut: nowIso(),
            dueDate,
            status: "borrowed",
          };
          const items = db.items.map((i) =>
            i.id === itemId ? { ...i, available: i.available - qty, updatedAt: nowIso() } : i
          );
          set({ db: { ...db, items, loans: [loan, ...db.loans] } });
          addAudit("loan.checkOut", { userId, targetId: loan.id, payload: { itemId, qty, dueDate } });
          return loan;
        },

        checkIn: (loanId) => {
          const { db } = get();
          const loan = db.loans.find((l) => l.id === loanId);
          if (!loan) throw new Error("Loan tidak ditemukan");
          if (loan.status === "returned") throw new Error("Sudah dikembalikan");
          const items = db.items.map((i) =>
            i.id === loan.itemId ? { ...i, available: i.available + loan.qty, updatedAt: nowIso() } : i
          );
          const loans = db.loans.map((l) =>
            l.id === loanId ? { ...l, status: "returned", dateIn: nowIso() } : l
          );
          set({ db: { ...db, items, loans } });
          addAudit("loan.checkIn", {
            targetId: loanId,
            payload: { itemId: loan.itemId, qty: loan.qty },
          });
          return loans.find((l) => l.id === loanId)!;
        },

        nextCode: (prefix) => {
          const { db } = get();
          const seq = (db.sequences[prefix] ?? 0) + 1;
          const padded = seq.toString().padStart(4, "0");
          const sequences = { ...db.sequences, [prefix]: seq };
          set({ db: { ...db, sequences } });
          return `${prefix.toUpperCase()}-${padded}`;
        },
      };
    },
    {
      name: "office-inventory-db",
      version: 1,
    }
  )
);
