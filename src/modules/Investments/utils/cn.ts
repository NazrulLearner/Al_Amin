// Tiny class-name joiner so this module does not depend on src/lib/utils.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
