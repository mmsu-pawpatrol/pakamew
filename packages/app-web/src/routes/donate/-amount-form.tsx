/**
 * Donation checkout form for fixed immediate-feed tiers.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useORPCClient } from "@/lib/orpc";
import { DONATION_TIERS } from "@pakamew/shared/lib/donation";
import { useMutation } from "@tanstack/react-query";
import { CircleAlertIcon } from "lucide-react";
import { useState } from "react";
import { DonationPresetSelector, type DonationPresetOption } from "./-amount-preset";

const pesoNumber = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	currencyDisplay: "narrowSymbol",
	maximumFractionDigits: 0,
});

function toCupLabel(approxCupLabel: string): string {
	return approxCupLabel.replace(/^about\s+/, "");
}

const PRESET_AMOUNT_OPTIONS: readonly DonationPresetOption[] = DONATION_TIERS.map(({ amount, approxCupLabel }) => {
	const label = pesoNumber.format(amount);
	const cupLabel = toCupLabel(approxCupLabel);

	return {
		value: String(amount),
		label,
		cupLabel,
		ariaLabel: `Select ${label} donation, ${approxCupLabel}`,
	};
});

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Unable to start checkout right now.";
}

function getFooterCopy(activeTier: (typeof DONATION_TIERS)[number] | undefined): string {
	if (activeTier) return "You’ll be redirected to Xendit hosted checkout.";

	return "Choose one of the fixed donation tiers to continue.";
}

/** Donation checkout form that starts a hosted Xendit payment session. */
export function DonationAmountForm() {
	const client = useORPCClient();
	const [selectedPreset, setSelectedPreset] = useState<string>("");
	const [name, setName] = useState("");
	const activeTier = DONATION_TIERS.find((tier) => String(tier.amount) === selectedPreset);
	const donationDisabled = !activeTier;

	const createCheckoutSessionMutation = useMutation({
		mutationFn: async () => {
			if (!activeTier) {
				throw new Error("Select a donation amount to continue.");
			}

			return await client.donations.CheckoutSession.create({
				amount: activeTier.amount,
				name: name.trim() || undefined,
			});
		},
		onSuccess: (result) => {
			window.location.assign(result.paymentLinkUrl);
		},
	});

	function handleDonateClick() {
		if (donationDisabled || createCheckoutSessionMutation.isPending) {
			return;
		}

		createCheckoutSessionMutation.mutate();
	}

	return (
		<>
			<CardContent className="px-5 py-6 sm:px-8">
				<FieldGroup className="gap-6">
					<DonationPresetSelector
						selectedPreset={selectedPreset}
						onValueChange={setSelectedPreset}
						options={PRESET_AMOUNT_OPTIONS}
					/>

					<Field>
						<FieldLabel htmlFor="donor-name">
							Name <span className="text-muted-foreground font-normal">(Optional)</span>
						</FieldLabel>
						<Input
							id="donor-name"
							autoComplete="name"
							name="donor-name"
							placeholder="Enter name ..."
							value={name}
							onChange={(event) => {
								setName(event.target.value);
							}}
						/>
					</Field>

					{createCheckoutSessionMutation.isError ? (
						<Alert variant="destructive">
							<CircleAlertIcon />
							<AlertTitle>Checkout unavailable</AlertTitle>
							<AlertDescription>{getErrorMessage(createCheckoutSessionMutation.error)}</AlertDescription>
						</Alert>
					) : null}
				</FieldGroup>
			</CardContent>

			<CardFooter className="flex-col items-stretch gap-3 border-t px-5 pb-10 sm:px-8 sm:pb-8">
				<Button
					type="button"
					size="lg"
					disabled={donationDisabled || createCheckoutSessionMutation.isPending}
					className="w-full"
					onClick={handleDonateClick}>
					{createCheckoutSessionMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
					{activeTier ? `Donate ${pesoNumber.format(activeTier.amount)}` : "Donate"}
				</Button>
				<p className="text-muted-foreground text-center text-xs">{getFooterCopy(activeTier)}</p>
			</CardFooter>
		</>
	);
}
