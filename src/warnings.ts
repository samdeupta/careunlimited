// Content problems that are not crashes: a misspelled setting, a setting with the wrong kind of value, a stylesheet
// without its brand colour. Modules add to this list while building; report.ts prints it at the end, and in --strict
// mode (the PR check and the deploy check) any entry fails the build. Same idea as missing.ts, for things other than files.

export const warnings: string[] = [];

export function warn(message: string): void {
  if (!warnings.includes(message)) warnings.push(message);
}
