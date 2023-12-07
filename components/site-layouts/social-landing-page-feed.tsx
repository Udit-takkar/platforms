import { Event, Organization, Post } from "@prisma/client";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import SiteNav from "../site-nav";
import ConnectPassportButton from "../buttons/ConnectPassportButton";
import LandingPageTabs from "./landing-page-tabs";
import prisma from "@/lib/prisma";
import PostCard from "../post-card";
import EventCard from "../event-card";

function mergeAndSortByDate(events: Event[], docs: Post[]) {
  // Merge the two arrays
  const merged = [...events, ...docs];

  // Sort the merged array by the createdAt property
  const sorted = merged.sort((a, b) => {
    // Ascending order
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return sorted;
}

export default async function SocialLandingPageFeed({
  sitedata,
  params,
}: {
  sitedata: Organization;
  params: { domain: string };
}) {
  const [events, docs] = await Promise.all([
    prisma.event.findMany({
      where: {
        organizationId: sitedata.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 3,
    }),
    prisma.post.findMany({
      where: {
        organizationId: sitedata.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 3,
    }),
  ]);

  console.log('events: ', events, 'docs: ', docs)

  // Usage
  const feed = mergeAndSortByDate(events, docs);

  return (
    <div className="w-full mx-auto pb-20 max-w-5xl">
      <h4 className="font-bold text-gray-750 tracking-tight mx-5 mb-3 mt-3">{"Latest"}</h4>
      {feed.map((eventOrDoc) => {
        if ("content" in eventOrDoc) {
          // Handle Post
          return (
            <PostCard
              key={eventOrDoc.id}
              data={Object.assign(eventOrDoc, { organization: sitedata })}
            />
          );
        } else if ("startingAt" in eventOrDoc) {
          // Handle Event
          return (
            <EventCard
              key={eventOrDoc.id}
              event={Object.assign(eventOrDoc, { organization: sitedata })}
            />
          );
        }
      })}
    </div>
  );
}
