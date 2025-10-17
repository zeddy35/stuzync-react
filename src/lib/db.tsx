import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI missing");

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } =
  (global as any)._mongooseCached || { conn: null, promise: null };

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    mongoose.set("strictQuery", false);
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    } as any);
  }
  cached.conn = await cached.promise;
  (global as any)._mongooseCached = cached;
  return cached.conn;
}
