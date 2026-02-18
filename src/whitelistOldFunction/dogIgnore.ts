// src/data/dogIgnore.ts
import { breedKey } from "@/data/breedKey";

export const IGNORE_KEYS = new Set<string>([
  // 写旧 API 的名字也行，我建议写规范化后的 key 更稳
  // "some breed",
].map(breedKey));