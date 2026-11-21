/*
 * Structured data (schema.org JSON-LD). `<` is escaped as recommended by the Next.js guide so a
 * string value can never close the script element (XSS).
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
