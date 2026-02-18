// src/data/buildWhitelist.ts
import type { DogBreed } from "@/api/dog";
import type { Dogbehave } from "@/api/dogbehave";
import { fetchDogsByName } from "@/api/dogbehave";
import { breedKey } from "@/data/breedKey";
import { IGNORE_KEYS } from "@/data/dogIgnore";
import { ALIAS_MAP } from "@/data/dogAliases";

export type BuildResult = {
  whitelist: string[];   // 只存名字
  blacklist: string[];   // 只存名字
};

function hasExactMatch(oldName: string, results: Dogbehave[]): boolean {
  const kOld = breedKey(oldName);
  return results.some(r => breedKey(r.name) === kOld);
}

export async function buildWhiteBlackFromOldBreeds(
  oldBreeds: DogBreed[],
  delayMs = 120
): Promise<BuildResult> {

  const whitelist: string[] = [];
  const blacklist: string[] = [];

  for (const b of oldBreeds) {
    const key = breedKey(b.name);
    const queryName = ALIAS_MAP.get(key) ?? b.name;

    try {
      const res = await fetchDogsByName(queryName);

      if (Array.isArray(res) && res.length > 0) {
        if (hasExactMatch(b.name, res)) {
          whitelist.push(b.name);
        } else {
          blacklist.push(b.name);
        }
      } else {
        blacklist.push(b.name);
      }
    } catch {
      blacklist.push(b.name);
    }

    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  // ✅ console 输出
  console.group(`Whitelist (${whitelist.length})`);
  console.log(whitelist);
  console.groupEnd();

  console.group(`Blacklist (${blacklist.length})`);
  console.log(blacklist);
  console.groupEnd();

  return { whitelist, blacklist };
}