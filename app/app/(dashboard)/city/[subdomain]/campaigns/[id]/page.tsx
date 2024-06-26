import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import notFound from "../../not-found";
import CampaignDashboard from "@/components/campaign-dashboard";


export default async function CampaignPage({
  params,
}: {
  params: { path: string; subdomain: string; id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const campaign = await prisma.campaign.findUnique({
    where: {
      id: params.id,
    },
    include: {
      organization: true,
      contributions: true,
    },
  });

  if (!campaign || !campaign.organization) {
    return notFound();
  }

  return <CampaignDashboard
    campaignId={params.id}
    subdomain={params.subdomain}
    isPublic={false}
  />
}