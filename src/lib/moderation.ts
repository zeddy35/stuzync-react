import fs from "node:fs/promises";
const PROVIDER = (process.env.MODERATION_PROVIDER || "none").toLowerCase();

export async function checkImage(absPath: string): Promise<boolean> {
  if (PROVIDER === "rekognition") return checkWithRekognition(absPath);
  if (PROVIDER === "nsfwjs") return checkWithNSFW(absPath);
  return true;
}

let rekognitionClient: any = null;
async function checkWithRekognition(absPath: string) {
  const { RekognitionClient, DetectModerationLabelsCommand } =
    await import("@aws-sdk/client-rekognition");
  if (!rekognitionClient)
    rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION || "eu-central-1" });
  const bytes = await fs.readFile(absPath);
  const cmd = new DetectModerationLabelsCommand({ Image: { Bytes: bytes }, MinConfidence: 80 });
  const res = await rekognitionClient.send(cmd);
  const flagged = (res.ModerationLabels || []).some((l: any) =>
    ["Explicit Nudity", "Sexual Activity", "Suggestive", "Nudity"].includes(l.ParentName || l.Name)
  );
  return !flagged;
}

let nsfwModelPromise: Promise<any> | null = null;
async function checkWithNSFW(absPath: string) {
  try {
    await import("@tensorflow/tfjs-node");
    const nsfw = await import("nsfwjs");
    const Canvas = await import("canvas");
    if (!nsfwModelPromise) nsfwModelPromise = nsfw.default.load();
    const model = await nsfwModelPromise;
    const img = await (Canvas as any).loadImage(absPath);
    const predictions = await model.classify(img);
    const bad = predictions.find((p: any) =>
      ["Porn", "Hentai", "Sexy"].includes(p.className) && p.probability > 0.7
    );
    return !bad;
  } catch (e) {
    console.error("nsfwjs failed:", e);
    return false;
  }
}
