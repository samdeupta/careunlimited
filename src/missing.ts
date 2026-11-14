// Files that content refers to but that don't exist. Modules add to these sets while rendering;
// report.ts prints them at the end (and fails the build in --strict mode).
export const missingImages = new Set<string>();
export const missingVideos = new Set<string>();
export const missingHeroVideos = new Set<string>();
