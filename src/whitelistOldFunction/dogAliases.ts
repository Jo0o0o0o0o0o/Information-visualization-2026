// src/data/dogAliases.ts
import { breedKey } from "@/data/breedKey";

const raw: Record<string, string> = {
  // "german shepherd dog": "german shepherd",
  // "st bernard": "saint bernard",
};

export const ALIAS_MAP = new Map<string, string>(
  Object.entries(raw).map(([k, v]) => [breedKey(k), v])
);