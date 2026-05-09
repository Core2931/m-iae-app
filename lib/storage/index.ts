import type { StorageAdapter } from "@/types";
import { SupabaseAdapter } from "./supabaseAdapter";

// Swap this one line to migrate back to localStorage: new LocalStorageAdapter()
export const storage: StorageAdapter = new SupabaseAdapter();
