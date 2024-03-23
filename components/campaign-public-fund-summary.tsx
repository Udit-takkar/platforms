"use client";

import CampaignTierCard from "@/components/campaign-tier-card";
import { formatAnswer } from "@/components/form-response-table/utils";
import { Button } from "@/components/ui/button";
import CampaignFundButton from "@/components/campaign-fund-button";
import { createCampaignApplication } from "@/lib/actions";
import { Answer, Campaign, CampaignTier, Form, FormResponse, Question } from "@prisma/client";

export type CampaignTierWithData = CampaignTier & { campaign: Campaign } & { Form: Form & { formResponse: Array<FormResponse & { answers: Array<Answer & { question: Question }> }> }};

export default async function CheckoutSummary({
  campaignTier,
}: {
  campaignTier: CampaignTierWithData
}) {
  let formattedFormAnswers = campaignTier.Form?.formResponse[0].answers.map(
    (value) => {
      const question = value.question;

      return (
        <div key={value.id}>
          <h2 className="text-xl">{question.text}</h2>
          <p className="text-sm">
            {formatAnswer(question!, value)}
          </p>
        </div>
      );
    },
  );

  return (
    <div className="flex flex-col min-h-full max-w-lg space-y-4 mx-6 my-6">
      <div>Here’s a summary of your application</div>
      <div className="w-full transform overflow-hidden rounded-2xl bg-gray-500 p-6 text-left align-middle shadow-xl transition-all">
        <div className="mt-2 flex flex-col space-y-6">
          {formattedFormAnswers}
        </div>
        <CampaignTierCard
          tier={campaignTier}
          currency={campaignTier.campaign.currency}
        />
        <div className="text-sm">
          *you can claim your refund if your application isn’t accepted.
        </div>
      </div>
      <div className="self-end ">
        <CampaignFundButton 
          campaign={campaignTier.campaign}
          amount={campaignTier.price as number}
          onComplete={() => {
            createCampaignApplication(campaignTier.campaign.id);
          }}
        />
      </div>
    </div>
  );
}