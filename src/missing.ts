// Files that content refers to but that don't exist. Modules add to these sets while rendering;
// report.mjs prints them at the end (and fails the build in --strict mode).
export const missingImages = new Set();
export const missingVideos = new Set();
export const missingHeroVideos = new Set();
