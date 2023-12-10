"use client";

import LaunchCampaignButton from "@/components/launch-campaign-button";
import CampaignContributeButton from "@/components/campaign-contribute-button";
import CampaignForm from "@/components/edit-campaign-form";
import useEthereum from "@/hooks/useEthereum";
import { Campaign } from "@prisma/client";
import { useState, useEffect } from 'react';
import { ethers } from "ethers";


export default function CampaignPageContent(
  {campaign, subdomain}: {campaign: Campaign, subdomain: string}
) {
  const { getContributionTotal } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(null);

  useEffect(() => {
    async function fetchTotalContributions() {
      if (campaign.deployed) {
        const total = await getContributionTotal(campaign.deployedAddress!);
        setTotalContributions(total);
      }
    }
    fetchTotalContributions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">
          {campaign.name}
        </h1>
        <p>
          {`threshold: ${campaign.threshold} ETH`}
        </p>
        <p>
          {`content: ${campaign.content}`}
        </p>
        <p>
          {`created ${campaign.createdAt.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: undefined,
            timeZoneName: undefined
          })}`}
        </p>
        <p>
          {`last updated ${campaign.updatedAt.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: undefined,
            timeZoneName: undefined
          })}`}
        </p>
        <p>
          {campaign.deployed
          ? `Deployed ${campaign.timeDeployed!.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: undefined,
            timeZoneName: undefined
          })} at ${campaign.deployedAddress} by ${campaign.sponsorEthAddress}`
          : "Not deployed"}
        </p>
        {totalContributions &&
          <p>
            {`Raised so far: ${ethers.formatEther(totalContributions)} ETH`}
          </p>
        }
      </div>
      <CampaignForm id={campaign.id} subdomain={subdomain} />
      {!campaign.deployed &&
            <LaunchCampaignButton campaign={campaign} subdomain={subdomain} />
      }
      {campaign.deployed && (
        <CampaignContributeButton
          campaign={campaign}
          subdomain={subdomain}
        />
      )}
    </div>
  );
}