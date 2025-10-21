// src/lib/db.ts
import mongoose from "mongoose";

declare global {
  // ensure single mongoose connection in dev
  // eslint-disable-next-line no-var
  var _mongooseCached:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

let cached = global._mongooseCached ?? { conn: null, promise: null };
global._mongooseCached = cached;

let warnedMissing = false;
export async function dbConnect() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // helpful message for yourself
    if (!warnedMissing) { console.warn('MONGODB_URI is undefined. Set it in .env.local.'); warnedMissing = true; }
    throw new Error("MONGODB_URI missing");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || undefined,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

