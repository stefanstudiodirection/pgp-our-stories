// Client-safe constants that can be shared without exposing secrets
export const PAGINATION = {
  ITEMS_PER_PAGE: 6,
} as const;

export const IMAGE_FALLBACK = {
  STORY: '/globe.svg',
} as const;
