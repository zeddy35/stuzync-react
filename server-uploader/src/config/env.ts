import 'dotenv/config';

const req = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  MONGODB_URI: req('MONGODB_URI'),

  R2_ACCOUNT_ID: req('R2_ACCOUNT_ID'),
  R2_ACCESS_KEY_ID: req('R2_ACCESS_KEY_ID'),
  R2_SECRET_ACCESS_KEY: req('R2_SECRET_ACCESS_KEY'),
  R2_BUCKET: req('R2_BUCKET'),
  R2_PUBLIC_BASE_URL: req('R2_PUBLIC_BASE_URL'),
  R2_ENDPOINT: req('R2_ENDPOINT'),

  USER_QUOTA_MB: parseInt(req('USER_QUOTA_MB'), 10),
  DAILY_UPLOAD_MB: parseInt(req('DAILY_UPLOAD_MB'), 10),
  MAX_IMAGE_MB: parseInt(req('MAX_IMAGE_MB'), 10),
  MAX_PDF_MB: parseInt(req('MAX_PDF_MB'), 10),
  SIGNED_URL_TTL_SEC: parseInt(req('SIGNED_URL_TTL_SEC'), 10),
};

