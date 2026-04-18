import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { HandHeartIcon } from "lucide-react";
import { DonationAmountForm } from "./-amount-form";

export const Route = createFileRoute("/donate/")({
	component: DonatePage,
});

function DonatePage() {
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

					<DonationAmountForm />
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
