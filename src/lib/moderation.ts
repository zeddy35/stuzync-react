export async function checkImage(_absPath: string): Promise<boolean> {
  // Moderation disabled to avoid native builds on Windows
  return true;
}
