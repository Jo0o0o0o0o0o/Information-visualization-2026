export type DogApiBreed = {
  name: string;
  breed_group?: string | null;
};

function normalizeName(input: string): string {
  return String(input ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(input: string): Set<string> {
  if (!input) return new Set();
  return new Set(input.split(" ").filter(Boolean));
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) {
    if (b.has(t)) inter += 1;
  }
  return inter / Math.max(a.size, b.size);
}

export function findBreedGroupByName(
  sourceName: string,
  breeds: DogApiBreed[],
): string | null {
  const target = normalizeName(sourceName);
  if (!target) return null;

  const exact = breeds.find((b) => normalizeName(b.name) === target);
  if (exact?.breed_group) return exact.breed_group;

  const contain = breeds.find((b) => {
    const n = normalizeName(b.name);
    return n.includes(target) || target.includes(n);
  });
  if (contain?.breed_group) return contain.breed_group;

  const targetTokens = tokenSet(target);
  let best: DogApiBreed | null = null;
  let bestScore = 0;

  for (const b of breeds) {
    const n = normalizeName(b.name);
    const score = overlapScore(targetTokens, tokenSet(n));
    if (score > bestScore) {
      bestScore = score;
      best = b;
    }
  }

  if (bestScore >= 0.6 && best?.breed_group) return best.breed_group;
  return null;
}

