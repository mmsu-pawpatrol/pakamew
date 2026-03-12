import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { HandHeartIcon } from "lucide-react";
import { useMemo, useState, type ChangeEvent } from "react";

export const Route = createFileRoute("/donate")({
	component: DonatePage,
});

const PRESET_AMOUNTS = [10, 20, 30, 40, 50, 100] as const;

function formatPeso(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		style: "currency",
		currency: "PHP",
		currencyDisplay: "narrowSymbol",
		maximumFractionDigits: 0,
	}).format(amount);
}

function DonatePage() {
	const [selectedPreset, setSelectedPreset] = useState<string>("");
	const [customAmount, setCustomAmount] = useState<string>("");
	const navigate = useNavigate({ from: Route.fullPath });
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	const activeAmount = useMemo(() => {
		if (customAmount.trim() !== "") {
			const parsedCustomAmount = Number(customAmount);
			if (Number.isFinite(parsedCustomAmount) && parsedCustomAmount > 0) {
				return parsedCustomAmount;
			}
			return null;
		}

		if (!selectedPreset) {
			return null;
		}

		const parsedPresetAmount = Number(selectedPreset);
		return Number.isFinite(parsedPresetAmount) && parsedPresetAmount > 0 ? parsedPresetAmount : null;
	}, [customAmount, selectedPreset]);

	function handlePresetChange(value: string) {
		setSelectedPreset(value);
		if (value) {
			setCustomAmount("");
		}
	}

	function handleCustomAmountChange(event: ChangeEvent<HTMLInputElement>) {
		const nextValue = event.target.value;
		setCustomAmount(nextValue);
		if (nextValue.trim() !== "") {
			setSelectedPreset("");
		}
	}

	function handleDonateClick() {
		if (!activeAmount) {
			return;
		}

		void navigate({ to: "./success" });
	}

	if (pathname.startsWith("/donate/")) {
		return <Outlet />;
	}

	return (
		<main className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pt-4 sm:px-6 sm:pt-6">
			{/* Accessible page heading for screen readers */}
			<h1 className="sr-only">Donate</h1>

			{/* Hero heading with photo placeholder background */}
			<section className="relative overflow-hidden rounded-3xl border px-6 pt-10 pb-24 text-center shadow-sm sm:px-8 sm:pt-14 sm:pb-28">
				<img
					src="/mr-fresh.jpg"
					alt=""
					aria-hidden
					className="absolute inset-0 h-full w-full object-cover object-center"
				/>
				<div
					aria-hidden
					className="from-background/50 via-background/75 to-background/90 absolute inset-0 bg-linear-to-b"
				/>

				<div className="bg-background/90 text-primary ring-border relative z-10 mx-auto mb-4 flex size-12 items-center justify-center rounded-full ring-1">
					<HandHeartIcon />
				</div>
				<p className="relative z-10 text-3xl font-semibold tracking-tight sm:text-4xl">Make a Donation</p>
				<p className="text-muted-foreground relative z-10 mt-2 text-sm sm:text-base">Every peso feeds a hungry stray</p>
			</section>

			{/* Anchored donation sheet that fills available vertical space */}
			<section className="bg-card relative -mt-10 flex flex-1 flex-col rounded-t-3xl border border-b-0 sm:-mt-14">
				<Card className="flex h-full flex-1 flex-col gap-0 rounded-none border-0 bg-transparent py-0 shadow-none ring-0">
					<CardHeader className="gap-2 px-5 pt-6 sm:px-8 sm:pt-8">
						<CardTitle className="text-2xl tracking-tight">Choose Amount</CardTitle>
						<CardDescription>Pick a preset amount or enter a custom value.</CardDescription>
					</CardHeader>

					<CardContent className="px-5 py-6 sm:px-8">
						<FieldGroup className="gap-6">
							<Field>
								<FieldTitle className="sr-only">Preset amounts</FieldTitle>
								<ToggleGroup
									type="single"
									variant="outline"
									size="lg"
									spacing={2}
									value={selectedPreset || undefined}
									onValueChange={handlePresetChange}
									className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
									{PRESET_AMOUNTS.map((amount) => (
										<ToggleGroupItem
											key={amount}
											value={String(amount)}
											aria-label={`Select ${formatPeso(amount)} donation`}
											className="h-11 w-full rounded-xl text-base font-semibold">
											{formatPeso(amount)}
										</ToggleGroupItem>
									))}
								</ToggleGroup>
							</Field>

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
							{activeAmount ? `Donate ${formatPeso(activeAmount)}` : "Donate"}
						</Button>
						<p className="text-muted-foreground text-center text-xs">
							{activeAmount ? `Selected amount: ${formatPeso(activeAmount)}` : "Select or enter an amount to continue."}
						</p>
					</CardFooter>
				</Card>

				{/* Fade the side borders near the bottom on desktop without changing layout flow. */}
				<div
					aria-hidden
					className="to-card pointer-events-none absolute bottom-0 -left-px hidden h-20 w-0.5 bg-linear-to-b from-transparent md:block"
				/>
				<div
					aria-hidden
					className="to-card pointer-events-none absolute -right-px bottom-0 hidden h-20 w-0.5 bg-linear-to-b from-transparent md:block"
				/>
			</section>
		</main>
	);
}
