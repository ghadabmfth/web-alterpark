/**
 * A same-site path for redirects after sign-in (?suivant=). Browsers drop tabs and newlines and
 * read "\" as "/", so "/\t/evil.example" or "/\evil.example" would leave the site: any control
 * character, whitespace or backslash is refused, and the path must resolve on our own origin.
 */
export function isSafeNextPath(next: string | null | undefined): boolean {
  if (!next || next.length > 512 || !next.startsWith("/") || next.startsWith("//")) return false;
  if (/[\u0000-\u001f\u007f\s\\]/.test(next)) return false;
  try {
    const base = "https://alterpark.invalid";
    const u = new URL(next, base);
    return u.origin === base && u.pathname.startsWith("/");
  } catch {
    return false;
  }
}
