export const dynamic = "force-dynamic";
export const revalidate = 0;

// Türkçe: Sunucu bileşeni; URL parametrelerini okuyup client formuna aktarır.
import RegisterForm from "./RegisterForm";

export default async function Page({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const oauth = String(searchParams.oauth || "") === "1";
  const name  = String(searchParams.name || "");
  const email = String(searchParams.email || "");
  return <RegisterForm oauth={oauth} name={name} email={email} />;
}

