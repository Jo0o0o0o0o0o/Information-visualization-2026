// src/utils/buildDogOriginPoints.ts
import type { DogBreed } from "@/types/dogBreed";
import type { DogApiBreed } from "@/types/dogApiBreed";
import { COUNTRY_CENTROIDS } from "@/data/countryCentroids";
import { findDogApiBreedByName } from "@/utils/fuzzyBreedMatch";
import type { WorldPoint } from "@/d3Viz/createWorldPlot";

/*xport type DogOriginPoint = {
  name: string;          // ninjas 的名字
  apiName: string;       // thedogapi 里匹配到的名字
  origin: string;        // 文字来源（可能是 "Scotland" 这类）
  countryCode: string;   // ISO2
  lon: number;
  lat: number;
};*/

function extractCountryCode(b: DogApiBreed): string | null {
  // 优先 country_code，其次 country_codes（有的可能多国，用空格/逗号分隔）
  const raw = (b.country_code ?? b.country_codes ?? "").toUpperCase();
  const m = raw.match(/[A-Z]{2}/);
  return m ? m[0] : null;
}

export function buildDogOriginPoints(
  ninjasDogs: DogBreed[],
  apiBreeds: DogApiBreed[],
): WorldPoint[] {
  const out: WorldPoint[] = [];

  for (const d of ninjasDogs) {
    const hit = findDogApiBreedByName(d.name, apiBreeds);
    if (!hit) continue;

    const cc = extractCountryCode(hit);
    if (!cc) continue;

    const centroid = COUNTRY_CENTROIDS[cc];
    if (!centroid) continue;

    const [lon, lat] = centroid;

    // ✅ [CHANGED] 直接产出 WorldPoint（包含 id）
    out.push({
      id: d.name, // ⭐关键：WorldPoint 必须有 id
      lon,
      lat,
      label: d.name,
      subtitle: `${cc}${hit.origin ? ` · ${String(hit.origin)}` : ""}`,
    });
  }

  return out;
}
