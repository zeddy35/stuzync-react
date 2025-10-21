import sharp from 'sharp';

export type VariantSpec = { width: number };
export const IMAGE_VARIANTS: VariantSpec[] = [
  { width: 256 },
  { width: 1024 },
  { width: 2048 },
];

export async function createWebpVariant(buf: Buffer, width: number): Promise<Buffer> {
  return sharp(buf).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
}

