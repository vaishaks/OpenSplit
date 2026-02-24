export function createHeroSeed(groupId: string, groupName: string): string {
  return `${groupId}:${groupName}`.toLowerCase();
}

export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function seedToHue(seed: string): number {
  return hashSeed(seed) % 360;
}

export function seedToGradient(seed: string): string {
  const hue = seedToHue(seed);
  const hue2 = (hue + 28) % 360;
  const hue3 = (hue + 62) % 360;
  return `linear-gradient(135deg, hsl(${hue} 72% 34%), hsl(${hue2} 72% 40%), hsl(${hue3} 78% 28%))`;
}
