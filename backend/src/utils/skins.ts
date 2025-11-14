export const MODERN_SKINS = ["adam", "ash", "lucy", "nancy"] as const;

export type ModernSkin = (typeof MODERN_SKINS)[number];

export const defaultSkin: ModernSkin = "adam";

export function normalizeSkin(input?: string | null): ModernSkin {
  if (!input) {
    return defaultSkin;
  }

  const normalized = input.toLowerCase();

  if ((MODERN_SKINS as readonly string[]).includes(normalized)) {
    return normalized as ModernSkin;
  }

  if (/^\d{3}$/.test(normalized)) {
    const numeric = parseInt(normalized, 10);
    if (!Number.isNaN(numeric)) {
      const mappedIndex = (numeric - 1) % MODERN_SKINS.length;
      return MODERN_SKINS[mappedIndex];
    }
  }

  if (normalized === "default") {
    return defaultSkin;
  }

  return defaultSkin;
}
