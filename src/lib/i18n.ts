import fs from "node:fs";
import path from "node:path";

const LOCALES_DIR = path.join(process.cwd(), "locales");
const cache = new Map<string, any>();

function load(locale: string) {
  const key = locale || "en";
  if (cache.has(key)) return cache.get(key);
  const file = path.join(LOCALES_DIR, `${key}.json`);
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : {};
  cache.set(key, data);
  return data;
}

export function tFactory(locale = "en") {
  const dict = load(locale);
  return (key: string, vars: Record<string, string | number> = {}) => {
    const val = key.split(".").reduce((o: any, k) => (o || {})[k], dict) ?? key;
    return Object.keys(vars).reduce((s, k) => String(s).replaceAll(`{${k}}`, String(vars[k])), val);
  };
}
