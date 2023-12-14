"use client";

import LaunchCampaignButton from "@/components/launch-campaign-button";
import CampaignWithdrawButton from "@/components/campaign-withdraw-button";
import useEthereum from "@/hooks/useEthereum";
import { Campaign } from "@prisma/client";
import { useState, useEffect } from 'react';
import { ethers } from "ethers";
import { getCampaign, updateCampaign } from "@/lib/actions";
import LoadingDots from "@/components/icons/loading-dots";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"
import { DatePicker } from "@/components/form-builder/date-picker";
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useRouter } from "next/navigation";


interface ModifiedFields {
  name: boolean;
  threshold: boolean;
  content: boolean;
}

interface Payload {
  id: string;
  name?: string;
  thresholdWei?: bigint;
  content?: string;
}

export default function CampaignDashboard(
  {campaignId, subdomain}:
  {campaignId: string, subdomain: string, isPublic: boolean}
) {
  const { getContributionTotal, getContractBalance } = useEthereum();
  const [totalContributions, setTotalContributions] = useState(BigInt(500000000000000000));
  const [contractBalance, setContractBalance] = useState(BigInt(0));
  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deadline, setDeadline] = useState(undefined);

  const router = useRouter();

  const triggerRefresh = () => {
    setRefreshFlag(prev => !prev);
  };

  useEffect(() => {
    getCampaign(campaignId).then(result => {
      if (result) {
        setCampaign(result);
      }
    }).then(() => setLoading(false));
  }, [refreshFlag, campaignId]);

  useEffect(() => {
    async function fetchTotalContributions() {
      if (campaign?.deployed) {
        const total = await getContributionTotal(campaign.deployedAddress!);
        setTotalContributions(total);
      }
    }
    fetchTotalContributions();

    async function fetchContractBalance() {
      if (campaign?.deployed) {
        const balance = await getContractBalance(campaign.deployedAddress!);
        setContractBalance(balance);
      }
    }
    fetchContractBalance();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign]);

  if (loading) {
    return <LoadingDots color="#808080" />
  }
  else if (!campaign || !campaign.organizationId) {
    return <div>Campaign not found</div>
  }

  const getProgress = (contributions: bigint, thresholdWei: bigint) => {
    if (contributions < thresholdWei) {
      return Number(contributions * BigInt(100) / thresholdWei);
    } else {
      return 100;
    }
  }

  return (
    <div>
      {loading ? (
        <LoadingDots color="#808080" />
      ) : !campaign || !campaign.organizationId ? (
        <div>Campaign not found</div>
      ) : (
        <div>
          <div className="space-y-4 my-4">
            <h1 className="text-2xl font-bold my-6">{campaign.name}</h1>
            <div className="bg-gray-800 p-6 flex space-x-4 rounded-md">
              <Progress
                value={getProgress(totalContributions, campaign.thresholdWei)}
                className="h-6 w-[60%]"
              />
              <p className="text-md">
                {`${ethers.formatEther(totalContributions)} of ${ethers.formatEther(campaign.thresholdWei)} ETH`}
              </p>
            </div>
            <p>{campaign.content}</p>
            <div className="flex space-x-4 items-center">
              <div>
                Deadline
              </div>
            </div>
            <div className="my-2">
              {campaign.deployed
              ? `Launched ${campaign.timeDeployed!.toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: undefined,
                timeZoneName: undefined
              })}`
              : "Not launched yet"}
            </div>

            {campaign.deployed && (
              <p>{`Contract balance: ${ethers.formatEther(contractBalance)} ETH`}</p>
            )}
          </div>
          <Button
            onClick={() => router.push(`/city/${subdomain}/campaigns/${campaignId}/settings`)}
          >
            Edit campaign
          </Button>
          <div className="mt-4">
            {!campaign.deployed &&
              <LaunchCampaignButton
                campaign={campaign}
                subdomain={subdomain}
                onComplete={triggerRefresh}
              />
            }
          </div>
        </div>
      )}
    </div>
  );
}