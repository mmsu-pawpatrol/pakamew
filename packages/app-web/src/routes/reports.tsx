import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useORPCClient } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	CalendarDaysIcon,
	ChartColumnIcon,
	CircleAlertIcon,
	CoinsIcon,
	PawPrintIcon,
	UsersRoundIcon,
} from "lucide-react";
import type * as React from "react";
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts";

const ReportMonthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const PesoFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});
const AveragePesoFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 2,
});
const DateFormatter = new Intl.DateTimeFormat("en-PH", {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

const weeklyChartConfig = {
	amount: {
		label: "Amount",
		color: "var(--color-chart-1)",
	},
} satisfies ChartConfig;

const dailyChartConfig = {
	amount: {
		label: "Amount",
		color: "var(--color-chart-1)",
	},
	donationCount: {
		label: "Donations",
		color: "var(--color-chart-3)",
	},
} satisfies ChartConfig;

interface DonationReportMonth {
	key: string;
	label: string;
}

interface DonationReportStats {
	averageDonation: number;
	donorCount: number;
	totalAmount: number;
}

interface DonationReportWeeklyBucket {
	amount: number;
	donationCount: number;
	donorCount: number;
	endDate: string;
	key: string;
	label: string;
	startDate: string;
}

interface DonationReportDailyBucket {
	amount: number;
	date: string;
	donationCount: number;
	donorCount: number;
	key: string;
	label: string;
}

interface DonationReportDonation {
	amount: number;
	donorName: string;
	id: string;
	occurredAt: string;
	userId: string | null;
}

interface DonationReport {
	availableMonths: DonationReportMonth[];
	dailyBuckets: DonationReportDailyBucket[];
	donations: DonationReportDonation[];
	selectedMonth: DonationReportMonth;
	stats: DonationReportStats;
	weeklyBuckets: DonationReportWeeklyBucket[];
}

export interface DonationReportSearch {
	month?: string;
}

export const Route = createFileRoute("/reports")({
	validateSearch: (search: Record<string, unknown>): DonationReportSearch => ({
		month: typeof search.month === "string" && ReportMonthPattern.test(search.month) ? search.month : undefined,
	}),
	component: ReportsPage,
});

function useDonationReport(month: string | undefined) {
	const client = useORPCClient();

	return useQuery<DonationReport>({
		queryKey: ["donations", "report", month ?? null],
		queryFn: async (): Promise<DonationReport> =>
			(await client.donations.report(month ? { month } : {})) as DonationReport,
		staleTime: 30_000,
	});
}

function ReportsPage() {
	const search = Route.useSearch();
	const donationReportQuery = useDonationReport(search.month);

	return (
		<main className="bg-background min-h-dvh w-full font-sans">
			<h1 className="sr-only">Donation Reports</h1>

			<div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-5 pb-10 sm:max-w-2xl lg:max-w-5xl">
				<ReportsHeader selectedMonth={donationReportQuery.data?.selectedMonth.label} />

				{donationReportQuery.isPending ? <ReportsSkeleton /> : null}

				{donationReportQuery.isError ? (
					<Alert variant="destructive">
						<CircleAlertIcon />
						<AlertTitle>Reports are unavailable</AlertTitle>
						<AlertDescription>The donation report could not be loaded right now.</AlertDescription>
					</Alert>
				) : null}

				{donationReportQuery.data ? <ReportsContent report={donationReportQuery.data} /> : null}
			</div>
		</main>
	);
}

function ReportsHeader({ selectedMonth }: { selectedMonth: string | undefined }) {
	return (
		<header className="flex flex-col gap-4">
			<Button asChild type="button" variant="ghost" className="h-auto w-fit px-0 py-1 pr-3 font-sans">
				<Link to="/profile">
					<ArrowLeftIcon data-icon="inline-start" />
					Back to Profile
				</Link>
			</Button>

			<div className="flex items-start justify-between gap-4">
				<div className="flex min-w-0 flex-col gap-1">
					<p className="text-muted-foreground font-heading text-xs font-bold tracking-[0.2em] uppercase">
						Donation Report
					</p>
					<h2 className="font-heading text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl">
						Monthly Donation Report
					</h2>
					<p className="text-muted-foreground text-sm">
						{selectedMonth ? `${selectedMonth} campus support activity` : "Campus support activity"}
					</p>
				</div>

				<div className="bg-accent text-accent-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
					<ChartColumnIcon className="size-5" />
				</div>
			</div>
		</header>
	);
}

function ReportsContent({ report }: { report: DonationReport }) {
	return (
		<div className="flex flex-col gap-6">
			<MonthSelector months={report.availableMonths} selectedMonthKey={report.selectedMonth.key} />

			<section className="grid grid-cols-3 gap-3" aria-label="Report metrics">
				<ReportStatCard icon={CoinsIcon} label="Total" value={PesoFormatter.format(report.stats.totalAmount)} />
				<ReportStatCard icon={UsersRoundIcon} label="Donors" value={String(report.stats.donorCount)} />
				<ReportStatCard
					icon={ChartColumnIcon}
					label="Avg."
					value={AveragePesoFormatter.format(report.stats.averageDonation)}
				/>
			</section>

			<WeeklyDonationsCard report={report} />
			<DailyDonationsCard report={report} />
			<DonationListCard report={report} />
		</div>
	);
}

function MonthSelector({
	months,
	selectedMonthKey,
}: {
	months: DonationReport["availableMonths"];
	selectedMonthKey: string;
}) {
	return (
		<nav
			aria-label="Report months"
			className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			<div className="flex w-max gap-2">
				{months.map((month) => (
					<Button
						key={month.key}
						asChild
						type="button"
						variant={month.key === selectedMonthKey ? "default" : "outline"}
						size="sm"
						className="font-heading h-8 rounded-full px-4 text-xs font-bold">
						<Link to="/reports" search={{ month: month.key }}>
							{month.label}
						</Link>
					</Button>
				))}
			</div>
		</nav>
	);
}

function ReportStatCard({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
}) {
	return (
		<Card size="sm" className="gap-0 py-0">
			<CardContent className="flex min-h-24 flex-col items-center justify-center gap-1 px-2 py-3 text-center">
				<div className="text-primary flex size-6 items-center justify-center">
					<Icon className="size-4" />
				</div>
				<p className="text-muted-foreground text-[0.68rem] leading-tight font-semibold">{label}</p>
				<p className="font-heading text-primary max-w-full truncate text-lg leading-tight font-extrabold tracking-tight">
					{value}
				</p>
			</CardContent>
		</Card>
	);
}

function WeeklyDonationsCard({ report }: { report: DonationReport }) {
	return (
		<section className="flex flex-col gap-3">
			<ReportSectionHeader
				title="Weekly Donations"
				description="Amount donated by week"
				badge={report.selectedMonth.label}
			/>
			<ChartContainer config={weeklyChartConfig} className="h-64 w-full">
				<BarChart data={report.weeklyBuckets} margin={{ top: 16, right: 14, left: 8, bottom: 0 }}>
					<CartesianGrid vertical={false} />
					<XAxis dataKey="label" tickLine={false} axisLine={false} />
					<YAxis
						tickLine={false}
						axisLine={false}
						width={54}
						tickFormatter={(value) => PesoFormatter.format(Number(value))}
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								formatter={(value, name) => (
									<div className="flex min-w-36 items-center justify-between gap-3">
										<span className="text-muted-foreground">{name === "amount" ? "Amount" : String(name)}</span>
										<span className="text-foreground font-mono font-medium tabular-nums">
											{PesoFormatter.format(Number(value))}
										</span>
									</div>
								)}
							/>
						}
					/>
					<Bar dataKey="amount" fill="var(--color-amount)" radius={[8, 8, 3, 3]} />
				</BarChart>
			</ChartContainer>
		</section>
	);
}

function DailyDonationsCard({ report }: { report: DonationReport }) {
	const donationCount = report.donations.length;

	return (
		<section className="flex flex-col gap-3">
			<ReportSectionHeader
				title="Daily Donations"
				description="Daily amount with donation-count bars"
				badge={`${report.dailyBuckets.length} days`}
				badgeVariant="outline"
			/>
			<ChartContainer config={dailyChartConfig} className="h-64 w-full">
				<ComposedChart data={report.dailyBuckets} margin={{ top: 16, right: 14, left: 8, bottom: 0 }}>
					<CartesianGrid vertical={false} />
					<XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={14} />
					<YAxis
						tickLine={false}
						axisLine={false}
						width={54}
						tickFormatter={(value) => PesoFormatter.format(Number(value))}
					/>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								formatter={(value, name) => (
									<div className="flex min-w-36 items-center justify-between gap-3">
										<span className="text-muted-foreground">{name === "amount" ? "Amount" : "Donations"}</span>
										<span className="text-foreground font-mono font-medium tabular-nums">
											{name === "amount" ? PesoFormatter.format(Number(value)) : Number(value).toLocaleString("en-PH")}
										</span>
									</div>
								)}
							/>
						}
					/>
					<Bar dataKey="donationCount" fill="var(--color-donationCount)" radius={[6, 6, 2, 2]} />
					<Area
						type="monotone"
						dataKey="amount"
						fill="var(--color-amount)"
						fillOpacity={0.16}
						stroke="var(--color-amount)"
						strokeWidth={2}
					/>
				</ComposedChart>
			</ChartContainer>
			<div className="flex flex-wrap items-center gap-2">
				<Badge variant="secondary" className="font-sans">
					{PesoFormatter.format(report.stats.totalAmount)} Donated
				</Badge>
				<Badge variant="outline" className="font-sans">
					{donationCount.toLocaleString("en-PH")} Donations
				</Badge>
			</div>
		</section>
	);
}

function DonationListCard({ report }: { report: DonationReport }) {
	return (
		<section className="flex flex-col gap-3">
			<ReportSectionHeader
				title="All Donations"
				description={`Completed donations in ${report.selectedMonth.label}`}
				badge={`${report.donations.length} completed`}
			/>
			{report.donations.length === 0 ? (
				<div className="bg-muted/40 flex flex-col items-center gap-2 rounded-lg px-4 py-10 text-center">
					<CalendarDaysIcon className="text-muted-foreground size-8" />
					<p className="font-heading font-bold">No completed donations</p>
					<p className="text-muted-foreground max-w-sm text-sm">
						Completed donations for this month will appear here once payments are confirmed.
					</p>
				</div>
			) : (
				<ul className="max-h-[28rem] overflow-y-auto pr-2 [scrollbar-width:thin]">
					{report.donations.map((donation, index) => (
						<li key={donation.id} className="border-border flex items-center gap-3 border-b py-3 last:border-b-0">
							<span className="text-muted-foreground font-heading w-5 shrink-0 text-center text-xs font-bold tabular-nums">
								{index + 1}
							</span>
							<span className="bg-accent text-accent-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
								<PawPrintIcon className="size-4" />
							</span>
							<span className="flex min-w-0 flex-1 flex-col">
								<span className="truncate text-sm font-semibold">{donation.donorName}</span>
								<time dateTime={donation.occurredAt} className="text-muted-foreground text-xs">
									{DateFormatter.format(new Date(donation.occurredAt))}
								</time>
							</span>
							<span className="text-primary font-heading shrink-0 text-sm font-extrabold">
								{PesoFormatter.format(donation.amount)}
							</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}

function ReportSectionHeader({
	badge,
	badgeVariant = "secondary",
	description,
	title,
}: {
	badge: string;
	badgeVariant?: "outline" | "secondary";
	description: string;
	title: string;
}) {
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="flex min-w-0 flex-col gap-1">
				<h3 className="font-heading text-sm font-extrabold tracking-[0.16em] uppercase">{title}</h3>
				<p className="text-muted-foreground text-sm">{description}</p>
			</div>
			<Badge variant={badgeVariant} className="font-heading shrink-0">
				{badge}
			</Badge>
		</div>
	);
}

function ReportsSkeleton() {
	return (
		<div className="flex flex-col gap-5">
			<div className="flex gap-2 overflow-hidden">
				{Array.from({ length: 4 }, (_, index) => (
					<Skeleton key={`report-month-skeleton-${index}`} className="h-9 w-24 shrink-0 rounded-full" />
				))}
			</div>

			<section className="grid grid-cols-3 gap-2.5">
				{Array.from({ length: 3 }, (_, index) => (
					<Card key={`report-stat-skeleton-${index}`} size="sm" className="gap-0 py-0">
						<CardContent className="flex min-h-24 flex-col items-center gap-2 px-2 py-3">
							<Skeleton className="size-6 rounded-full" />
							<div className="flex w-full flex-col items-center gap-2">
								<Skeleton className="h-3 w-14" />
								<Skeleton className="h-5 w-16" />
							</div>
						</CardContent>
					</Card>
				))}
			</section>

			<div className="grid grid-cols-1 gap-4">
				{Array.from({ length: 2 }, (_, index) => (
					<div key={`report-chart-skeleton-${index}`} className="flex flex-col gap-3">
						<div className="flex flex-col gap-2">
							<Skeleton className="h-5 w-36" />
							<Skeleton className="h-4 w-48" />
						</div>
						<Skeleton className="h-56 w-full rounded-lg" />
					</div>
				))}
			</div>
		</div>
	);
}
