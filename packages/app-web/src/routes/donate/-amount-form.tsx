import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState, type ChangeEvent } from "react";
import { DonationPresetSelector, type DonationPresetOption } from "./-amount-preset";

const pesoNumber = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	currencyDisplay: "narrowSymbol",
	maximumFractionDigits: 0,
});

const PRESET_AMOUNTS = [10, 20, 30, 40, 50, 100] as const;
const PRESET_AMOUNT_OPTIONS: readonly DonationPresetOption[] = PRESET_AMOUNTS.map((amount) => {
	const label = pesoNumber.format(amount);
	return { value: String(amount), label, ariaLabel: `Select ${label} donation` };
});

function getActiveDonationAmount(selectedPreset: string, customAmount: string) {
	if (customAmount.trim() !== "") {
		const parsedCustomAmount = Number(customAmount);
		if (Number.isFinite(parsedCustomAmount) && parsedCustomAmount > 0) {
			return parsedCustomAmount;
		}

		return null;
	}

	if (!selectedPreset) return null;

	const parsedPresetAmount = Number(selectedPreset);
	return Number.isFinite(parsedPresetAmount) && parsedPresetAmount > 0 ? parsedPresetAmount : null;
}

export function DonationAmountForm() {
	const [selectedPreset, setSelectedPreset] = useState<string>("");
	const [customAmount, setCustomAmount] = useState<string>("");
	const navigate = useNavigate();
	const activeAmount = getActiveDonationAmount(selectedPreset, customAmount);

	const handlePresetChange = useCallback((value: string) => {
		setSelectedPreset(value);
		if (value) setCustomAmount("");
	}, []);

	function handleCustomAmountChange(event: ChangeEvent<HTMLInputElement>) {
		const nextValue = event.target.value;
		setCustomAmount(nextValue);
		if (nextValue.trim() !== "") setSelectedPreset("");
	}

	function handleDonateClick() {
		if (!activeAmount) return;
		void navigate({ to: "/donate/success" });
	}

	return (
		<>
			<CardContent className="px-5 py-6 sm:px-8">
				<FieldGroup className="gap-6">
					<DonationPresetSelector
						selectedPreset={selectedPreset}
						onValueChange={handlePresetChange}
						options={PRESET_AMOUNT_OPTIONS}
					/>

					<Field>
						<FieldLabel className="sr-only" htmlFor="donation-custom-amount">
							Custom amount
						</FieldLabel>
						<InputGroup>
							<InputGroupAddon
								align="inline-start"
								className="border-input h-full min-w-9 shrink-0 justify-center self-stretch border-r px-0">
								<InputGroupText className="text-foreground font-semibold">₱</InputGroupText>
							</InputGroupAddon>
							<InputGroupInput
								className="pl-2.5!"
								id="donation-custom-amount"
								type="number"
								inputMode="decimal"
								min={1}
								step="1"
								placeholder="Enter custom amount"
								value={customAmount}
								onChange={handleCustomAmountChange}
							/>
						</InputGroup>
					</Field>
				</FieldGroup>
			</CardContent>

			<CardFooter className="mt-auto flex-col items-stretch gap-3 border-t px-5 pt-5 pb-10 sm:px-8 sm:pb-8">
				<Button type="button" size="lg" disabled={!activeAmount} className="w-full" onClick={handleDonateClick}>
					{activeAmount ? `Donate ${pesoNumber.format(activeAmount)}` : "Donate"}
				</Button>
				<p className="text-muted-foreground text-center text-xs">
					{activeAmount
						? `Selected amount: ${pesoNumber.format(activeAmount)}`
						: "Select or enter an amount to continue."}
				</p>
			</CardFooter>
		</>
	);
}
