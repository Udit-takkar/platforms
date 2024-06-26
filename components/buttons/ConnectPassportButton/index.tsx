"use client";
import PrimaryButton, {
  PrimaryButtonProps,
} from "@/components/buttons/primary-button";
import {
  SignInMessagePayload,
  useFetchUser,
  openSignedZuzaluSignInPopup,
  useSemaphoreSignatureProof,
  useZupassPopupMessages,
  ZupassUserJson,
} from "@pcd/passport-interface";
import { ZUPASS_SERVER_URL, ZUPASS_URL } from "./constants";
import {
  PCD,
  PackedProof,
  SemaphoreSignaturePCDClaim,
  constructPassportPcdGetRequestUrl,
} from "@/lib/pcd-light";
import { ReactNode, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Opens a Zupass popup to make a proof of a ZK EdDSA event ticket PCD.
 */
// function openZKEdDSAEventTicketPopup(
//   fieldsToReveal: EdDSATicketFieldsToReveal,
//   watermark: bigint,
//   validEventIds: string[],
//   validProductIds: string[],
// ) {
//   // These arguments determine the options that will be passed in to the ZK
//   // proving screen. Where `userProvided` is true, the user must input or
//   // select an option.
//   // This particular proof will be a proof about an EdDSA ticket that the user
//   // owns, and so the options relate to the selection of the ticket and the
//   // claim that the user will make about it.
//   const args: ZKEdDSAEventTicketPCDArgs = {
//     // This allows the user to choose a ticket to make a proof about.
//     ticket: {
//       argumentType: ArgumentTypeName.PCD,
//       pcdType: EdDSATicketPCDPackage.name,
//       value: undefined,
//       userProvided: true,
//       validatorParams: {
//         // It is possible to filter the tickets the user can choose from by
//         // event ID and product ID. Empty arrays mean that no filtering will
//         // occur.
//         eventIds: validEventIds,
//         productIds: validProductIds,
//         notFoundMessage: "No eligible PCDs found",
//       },
//     },
//     // This is the user's Semaphore identity, which is required in order to
//     // prove that the user controls the identity that the ticket was created
//     // for.
//     identity: {
//       argumentType: ArgumentTypeName.PCD,
//       pcdType: SemaphoreIdentityPCDPackage.name,
//       value: undefined,
//       userProvided: true,
//     },
//     // If we want the proof to show that the ticket belongs to a certain event
//     // or set of events, the event IDs can be passed in here.
//     validEventIds: {
//       argumentType: ArgumentTypeName.StringArray,
//       value: validEventIds.length != 0 ? validEventIds : undefined,
//       userProvided: false,
//     },
//     // The fields to reveal in the claim.
//     fieldsToReveal: {
//       argumentType: ArgumentTypeName.ToggleList,
//       value: fieldsToReveal,
//       userProvided: false,
//     },
//     // The watermark can be used to ensure that the proof is used only once.
//     // This can be done by, for example, generating a random number, passing
//     // it in as the watermark, and then checking that the proof contains a
//     // matching watermark.
//     watermark: {
//       argumentType: ArgumentTypeName.BigInt,
//       value: watermark.toString(),
//       userProvided: false,
//     },
//     // The external nullifier is an input into the nullifier hash, which is a
//     // function of the user's identity and the external nullifier. The
//     // nullifier hash can be used to determine that two proofs with identical
//     // nullifier hashes where produced by the same user, without revealing the
//     // user's identity (provided that the external nullifier is the same in
//     // both cases).
//     externalNullifier: {
//       argumentType: ArgumentTypeName.BigInt,
//       value: "12345",
//       userProvided: false,
//     },
//   };

//   const popupUrl = window.location.origin + "/popup";
//   const ZUPASS_PRODUCTION_URL = "https://zupass.org";

//   // Create the Zupass URL which will be loaded in the popup window.
//   const proofUrl = constructZupassPcdGetRequestUrl(
//     process.env.ZUPASS_SERVER_URL ?? ZUPASS_PRODUCTION_URL,
//     popupUrl,
//     ZKEdDSAEventTicketPCDPackage.name,
//     args,
//     {
//       genericProveScreen: true,
//       title: "ZKEdDSA Ticket Proof",
//       description: "ZKEdDSA Ticket PCD Request",
//     },
//   );

//   // Open the popup window. This points /popup on the local site, with the
//   // Zupass URL as a query parameter. In `popup.tsx` we do a redirect to the
//   // Zupass URL.
//   openZupassPopup(popupUrl, proofUrl);
// }

type ConnectPassportButtonProps = {
  onSuccess?: ({
    user,
    proof,
    _raw,
  }: {
    user: ZupassUserJson;
    proof: PCD<SemaphoreSignaturePCDClaim, PackedProof>;
    _raw: string;
  }) => void;
  callbackUrl?: string;
} & Omit<PrimaryButtonProps, "loading">;

function ConnectPassportButton({
  onSuccess,
  callbackUrl = "/",
  ...props
}: ConnectPassportButtonProps) {
  const openPopup = () => {
    openSignedZuzaluSignInPopup(
      ZUPASS_URL,
      window.location.origin + "/popup",
      "consumer-client",
    );
  };

  const [pcdStr] = useZupassPopupMessages();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (pcdStr) {
        console.log(pcdStr);
      }
    })();
  }, [pcdStr]);

  const [signatureProofValid, setSignatureProofValid] = useState<
    boolean | undefined
  >();
  // Extract UUID, the signed message of the returned PCD
  const [signedMessage, setSignedMessage] = useState<
    SignInMessagePayload | undefined
  >();

  const onProofVerified = (valid: boolean) => {
    setSignatureProofValid(valid);
  };

  const { signatureProof } = useSemaphoreSignatureProof(
    pcdStr,
    onProofVerified,
  );

  useEffect(() => {
    if (signatureProofValid && signatureProof) {
      const signInPayload = JSON.parse(
        signatureProof.claim.signedMessage,
      ) as SignInMessagePayload;
      setSignedMessage(signInPayload);
    }
  }, [signatureProofValid, signatureProof]);

  const {
    user,
    error,
    loading: fetchUserLoading,
  } = useFetchUser(ZUPASS_SERVER_URL, true, signedMessage?.uuid);
  console.log({ user, error, fetchUserLoading });

  useEffect(() => {
    if (user && signatureProof && pcdStr) {
      signInWithZupass();
      if (onSuccess) {
        onSuccess({ user, proof: signatureProof, _raw: pcdStr });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const signInWithZupass = async () => {
    try {
      setLoading(true);
      const response = await signIn("zupass", {
        userId: user?.uuid,
        email: user?.email,
        ...user,
        proof: signatureProof,
        _raw: pcdStr,
        redirect: true,
        callbackUrl,
      });

      console.error(response?.error);
      if (response?.ok && !response?.error) {
        router.replace(callbackUrl);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrimaryButton
      {...props}
      disabled={loading || fetchUserLoading}
      loading={loading || fetchUserLoading}
      onClick={() => {
        openPopup();
      }}
    >
      <span className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-book-check w-4"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="m9 9.5 2 2 4-4" />
        </svg>
        <span className="group-hover:text-fora-primary ml-2  mr-2 transition-all duration-100">
          {user?.email
            ? user.email
            : props.children
            ? props.children
            : "Sign in with ZuPass"}
        </span>
      </span>
    </PrimaryButton>
  );
}

export default ConnectPassportButton;
