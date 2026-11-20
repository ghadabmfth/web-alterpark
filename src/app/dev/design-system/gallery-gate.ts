/** The design-system gallery is served in development, or on a Preview with DESIGN_SYSTEM_GALLERY=true. */
export function galleryEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.DESIGN_SYSTEM_GALLERY === "true";
}
