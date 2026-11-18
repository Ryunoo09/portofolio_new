import { getProfile } from "@/data";

export default async function HomePage() {
  const profile = await getProfile();

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-fg font-display text-4xl tracking-tight">{profile.full_name}</h1>
      <p className="text-fg-muted mt-3 text-base">{profile.headline}</p>
      <p className="text-fg-muted mt-6 text-sm">Sections arrive in later steps.</p>
    </section>
  );
}
