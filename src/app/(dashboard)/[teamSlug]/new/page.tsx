import { redirect, notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getServerSession } from "../../../../lib/server-session";
import { getDb } from "../../../../lib/db";
import { team } from "../../../../db/schema";
import { NewProjectPageClient } from "./NewProjectPageClient";

interface PageProps {
  params: Promise<{ teamSlug: string }>;
}

export default async function NewProjectPage({ params }: PageProps) {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const { teamSlug } = await params;
  const db = getDb();

  const [teamData] = await db
    .select({
      id: team.id,
      name: team.name,
      slug: team.slug,
      ownerId: team.ownerId,
    })
    .from(team)
    .where(eq(team.slug, teamSlug))
    .limit(1);

  if (!teamData || teamData.ownerId !== session.user.id) {
    notFound();
  }

  return (
    <NewProjectPageClient
      teamId={teamData.id}
      teamName={teamData.name}
      teamSlug={teamData.slug}
    />
  );
}
