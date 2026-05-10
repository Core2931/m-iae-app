"use client";

import { create } from "zustand";
import type { Expense, Group, GroupMember } from "@/types";
import { storage } from "@/lib/storage";
import { SupabaseAdapter } from "@/lib/storage/supabaseAdapter";

const ACTIVE_GROUP_KEY = "m-iae-active-group";

interface ExpenseStore {
  groups: Group[];
  activeGroupId: string | null;
  members: GroupMember[];
  groupName: string;
  groupsChecked: boolean;
  currentUserId: string | null;
  expenses: Expense[];
  isLoaded: boolean;

  setCurrentUser(userId: string): void;
  setGroups(groups: Group[]): void;
  setActiveGroup(groupId: string): void;
  addGroup(group: Group): void;
  clearGroups(): void;
  resetStore(): void;
  load(): Promise<void>;
  addExpense(data: Omit<Expense, "id" | "createdAt">): Promise<void>;
  updateExpense(id: string, updates: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  saveGroupName(name: string): Promise<void>;
  updateMyDisplayName(name: string): Promise<void>;
}

const adapter = storage as SupabaseAdapter;

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  groups: [],
  activeGroupId: null,
  members: [],
  groupName: "",
  groupsChecked: false,
  currentUserId: null,
  expenses: [],
  isLoaded: false,

  setCurrentUser(userId) {
    adapter.currentUserId = userId;
    set({ currentUserId: userId });
  },

  setGroups(groups) {
    // Pick saved active group or default to first
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(ACTIVE_GROUP_KEY) : null;
    const activeGroupId =
      saved && groups.find((g) => g.id === saved)
        ? saved
        : groups[0]?.id ?? null;

    if (activeGroupId) {
      adapter.groupId = activeGroupId;
    }
    set({ groups, groupsChecked: true, activeGroupId, isLoaded: false, expenses: [], members: [], groupName: "" });
  },

  setActiveGroup(groupId) {
    adapter.groupId = groupId;
    if (typeof window !== "undefined") localStorage.setItem(ACTIVE_GROUP_KEY, groupId);
    set({ activeGroupId: groupId, isLoaded: false, expenses: [], members: [], groupName: "" });
  },

  addGroup(group) {
    set((s) => ({ groups: [...s.groups, group] }));
  },

  clearGroups() {
    adapter.groupId = null;
    set({ groups: [], activeGroupId: null, groupsChecked: true, isLoaded: false, expenses: [], members: [], groupName: "" });
  },

  resetStore() {
    adapter.groupId = null;
    adapter.currentUserId = null;
    set({
      groups: [],
      activeGroupId: null,
      members: [],
      groupName: "",
      groupsChecked: false,
      currentUserId: null,
      expenses: [],
      isLoaded: false,
    });
  },

  async load() {
    if (!adapter.groupId) return;
    const [expenses, { name, members }] = await Promise.all([
      storage.getExpenses(),
      storage.getGroupInfo(),
    ]);
    set({ expenses, members, groupName: name, isLoaded: true });
  },

  async addExpense(data) {
    const expense: Expense = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await storage.addExpense(expense);
    set((s) => ({ expenses: [expense, ...s.expenses] }));
  },

  async updateExpense(id, updates) {
    await storage.updateExpense(id, updates);
    set((s) => ({
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }));
  },

  async deleteExpense(id) {
    await storage.deleteExpense(id);
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }));
  },

  async saveGroupName(name) {
    await storage.saveGroupName(name);
    set({ groupName: name });
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === get().activeGroupId ? { ...g, name } : g
      ),
    }));
  },

  async updateMyDisplayName(name) {
    await storage.updateMyDisplayName(name);
    set((s) => ({
      members: s.members.map((m) =>
        m.userId === s.currentUserId ? { ...m, displayName: name } : m
      ),
    }));
  },
}));
