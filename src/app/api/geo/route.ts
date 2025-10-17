export async function GET() {
  try {
    const r = await fetch("https://ipapi.co/json/", { cache: "no-store", next: { revalidate: 0 } });
    if (r.ok) {
      const j = await r.json();
      if (j?.country && j?.country_calling_code) {
        return Response.json({
          countryName: j.country_name || j.country,
          countryCode: j.country,
          dialCode: j.country_calling_code,
        });
      }
    }
  } catch {}
  return Response.json({ countryName: "Turkey", countryCode: "TR", dialCode: "+90" });
}
