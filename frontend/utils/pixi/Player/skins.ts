import type { Direction } from "../types";

type DirectionKey = Direction;

type Range = [number, number];

type AtlasAnimationConfig = {
  atlasPath: string;
  prefix: string;
  idlePrefix: string;
  walkPrefix: string;
  directionRanges: Record<DirectionKey, Range>;
};

export type SkinDefinition = {
  id: string;
  label: string;
  kind: "atlas";
  selectable: boolean;
  preview: string;
  previewAnimated: boolean;
  animationSpeed?: number;
  atlas: AtlasAnimationConfig;
};

const MODERN_SKINS: Array<{ id: string; label: string }> = [
  { id: "adam", label: "Adam" },
  { id: "ash", label: "Ash" },
  { id: "lucy", label: "Lucy" },
  { id: "nancy", label: "Nancy" },
];

// TexturePacker exports the run/idle strips in this order: right → up → left → down.
const DIRECTION_RANGES: Record<DirectionKey, Range> = {
  right: [1, 6],
  up: [7, 12],
  left: [13, 18],
  down: [19, 24],
};

const definitions: Record<string, SkinDefinition> = MODERN_SKINS.reduce(
  (accumulator, skin) => {
    accumulator[skin.id] = {
      id: skin.id,
      label: skin.label,
      kind: "atlas",
      selectable: true,
      preview: `/assets/character/single/${skin.label}_idle_anim_1.png`,
      previewAnimated: false,
      animationSpeed: 0.18,
      atlas: {
        atlasPath: `/assets/character/${skin.id}.json`,
        prefix: skin.label,
        idlePrefix: "idle_anim",
        walkPrefix: "run",
        directionRanges: DIRECTION_RANGES,
      },
    };
    return accumulator;
  },
  {} as Record<string, SkinDefinition>,
);

export const skinDefinitions = definitions;

export const selectableSkins = MODERN_SKINS.map((skin) => skin.id);

export const defaultSkin = "adam";

const selectableSkinSet = new Set(selectableSkins);

export function resolveSkinId(id?: string | null): string {
  if (!id) {
    return defaultSkin;
  }

  const normalized = id.toLowerCase();

  if (selectableSkinSet.has(normalized)) {
    return normalized;
  }

  // Map legacy numeric skins to modern counterparts in a stable way.
  if (/^\d{3}$/.test(normalized)) {
    const numeric = parseInt(normalized, 10);
    if (!Number.isNaN(numeric)) {
      const mappedIndex = (numeric - 1) % selectableSkins.length;
      return selectableSkins[mappedIndex];
    }
  }

  if (normalized === "default") {
    return defaultSkin;
  }

  return defaultSkin;
}

export function getSkinDefinition(id: string): SkinDefinition {
  const resolved = resolveSkinId(id);
  return skinDefinitions[resolved];
}

export function getSkinPreview(id: string): { src: string; animated: boolean } {
  const definition = getSkinDefinition(id);
  return { src: definition.preview, animated: definition.previewAnimated };
}

export function getAnimationConfig(id: string): AtlasAnimationConfig {
  return getSkinDefinition(id).atlas;
}

export function getAnimationSpeed(id: string): number {
  return getSkinDefinition(id).animationSpeed ?? 0.18;
}