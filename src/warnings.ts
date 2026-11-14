
export const warnings: string[] = [];

export function warn(message: string): void {
  if (!warnings.includes(message)) warnings.push(message);
}
