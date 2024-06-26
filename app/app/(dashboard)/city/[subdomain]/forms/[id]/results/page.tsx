"use server";

import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import FormResponseDataTable from "@/components/form-response-table/form-response-data-table";

export default async function FormResultsPage({
  params,
}: {
  params: { path: string; subdomain: string; id: string };
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const questions = await prisma.question.findMany({
    where: {
      formId: params.id,
    },
    include: {
      form: true,
    },
  });

  const formResponses = await prisma.formResponse.findMany({
    where: {
      formId: params.id,
    },
    include: {
      user: true,
      answers: true,
    },
  });

  if (!formResponses) {
    return notFound();
  }


  return (
    <div>
      <FormResponseDataTable questions={questions} formResponses={formResponses} />
    </div>
  );
}
