// Aperçu d'un live : la photo du compte (téléversée par le vendeur), sinon la photo d'un de ses produits, sinon le visuel de sa catégorie.
export function liveImage(input: { profilePhoto?: string | null; productPhotoKey?: string | null; categorySlug: string }): { src: string; own: boolean } {
  if (input.profilePhoto) return { src: input.profilePhoto, own: true };
  if (input.productPhotoKey) return { src: input.productPhotoKey.startsWith("/") ? input.productPhotoKey : `/api/files/${input.productPhotoKey}`, own: true };
  return { src: `/images/cat-${input.categorySlug}.webp`, own: false };
}
