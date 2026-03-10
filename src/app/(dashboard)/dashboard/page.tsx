import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getServerSession } from "../../../lib/server-session";
import { getDb } from "../../../lib/db";
import { team } from "../../../db/schema";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/");
  }

  const db = getDb();
  const [firstTeam] = await db
    .select({ slug: team.slug })
    .from(team)
    .where(eq(team.ownerId, session.user.id))
    .orderBy(desc(team.updatedAt))
    .limit(1);

  if (firstTeam) {
    redirect(`/${firstTeam.slug}`);
  }

  redirect("/new");
}
