import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useORPCClient, type ORPCClient } from "@/lib/orpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowUpRightIcon,
	Clock3Icon,
	RadioIcon,
	RefreshCcwIcon,
	SendHorizonalIcon,
	SquareTerminalIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_demo/dispenser-control")({
	component: DispenserControlPage,
});

type FeederMode = "duration" | "angle";
type FeederStatusResponse = Awaited<ReturnType<ORPCClient["feeder"]["status"]>>;
type FeederTriggerInput = Parameters<ORPCClient["feeder"]["trigger"]>[0];
type FeederTriggerResponse = Awaited<ReturnType<ORPCClient["feeder"]["trigger"]>>;

const DURATION_RANGE = { min: 200, max: 30000, defaultValue: 1500 } as const;
const ANGLE_RANGE = { min: 1, max: 360, defaultValue: 180 } as const;

function getResultBadgeVariant(
	result: FeederTriggerResponse["result"] | FeederStatusResponse["latestKnownDeviceState"]["state"],
) {
	if (result === "accepted" || result === "completed" || result === "booted") {
		return "secondary";
	}

	if (result === "busy" || result === "timeout" || result === "offline" || result === "unknown") {
		return "outline";
	}

	return "destructive";
}

function getConnectivityLabel(status: FeederStatusResponse | undefined) {
	if (!status) {
		return "loading";
	}

	if (!status.broker.connected) {
		return "broker offline";
	}

	if (status.latestKnownDeviceState.state === "unknown") {
		return "awaiting device state";
	}

	if (status.latestKnownDeviceState.busy) {
		return "device busy";
	}

	return "ready";
}

function buildActiveCommand(mode: FeederMode, durationMs: number, angle: number): FeederTriggerInput {
	if (mode === "duration") {
		return {
			mode,
			openDurationMs: durationMs,
		};
	}

	return {
		mode,
		angle,
	};
}

function normalizeLastCommand(status: FeederStatusResponse | undefined, response: FeederTriggerResponse | undefined) {
	if (response) {
		return {
			requestId: response.requestId,
			mode: response.command.mode,
			result: response.result,
			acknowledgementState: response.acknowledgementState,
			angle: response.command.mode === "angle" ? response.command.angle : null,
			openDurationMs: response.command.mode === "duration" ? response.command.openDurationMs : null,
			submittedAt: response.requestedAt,
			respondedAt: response.respondedAt,
			message: response.message,
		};
	}

	if (!status?.lastCommand) {
		return null;
	}

	return status.lastCommand;
}

function DispenserControlPage() {
	const client = useORPCClient();
	const [mode, setMode] = useState<FeederMode>("duration");
	const [durationMs, setDurationMs] = useState<number>(DURATION_RANGE.defaultValue);
	const [angle, setAngle] = useState<number>(ANGLE_RANGE.defaultValue);

	const statusQuery = useQuery({
		queryKey: ["demo", "feeder-status"],
		queryFn: async () => await client.feeder.status(),
		refetchInterval: 4000,
	});

	const triggerMutation = useMutation({
		mutationFn: async (command: FeederTriggerInput) => await client.feeder.trigger(command),
		onSuccess: async () => {
			await statusQuery.refetch();
		},
	});

	const status = statusQuery.data;
	const lastCommand = normalizeLastCommand(status, triggerMutation.data);
	const connectivityLabel = getConnectivityLabel(status);
	const currentCommand = buildActiveCommand(mode, durationMs, angle);
	const deviceBusy = status?.latestKnownDeviceState.busy ?? false;
	const submitDisabled = triggerMutation.isPending || deviceBusy || !status?.broker.connected;

	const statusAlert =
		triggerMutation.data != null
			? {
					title:
						triggerMutation.data.result === "accepted"
							? "Command acknowledged"
							: triggerMutation.data.result === "busy"
								? "Device is busy"
								: triggerMutation.data.result === "timeout"
									? "Acknowledgement timed out"
									: "Command failed",
					description:
						triggerMutation.data.message ??
						(triggerMutation.data.result === "accepted"
							? "The device accepted the request and will finish its motor cycle asynchronously."
							: "The app server could not complete the publish-and-wait flow."),
				}
			: statusQuery.error
				? {
						title: "Status unavailable",
						description: "The server could not load feeder status right now.",
					}
				: null;

	function handleManualRefresh() {
		void statusQuery.refetch();
	}

	function handleDurationInputChange(nextValue: string) {
		const parsedValue = Number(nextValue);
		if (!Number.isFinite(parsedValue)) {
			setDurationMs(DURATION_RANGE.defaultValue);
			return;
		}

		setDurationMs(Math.min(DURATION_RANGE.max, Math.max(DURATION_RANGE.min, Math.round(parsedValue))));
	}

	function handleAngleInputChange(nextValue: string) {
		const parsedValue = Number(nextValue);
		if (!Number.isFinite(parsedValue)) {
			setAngle(ANGLE_RANGE.defaultValue);
			return;
		}

		setAngle(Math.min(ANGLE_RANGE.max, Math.max(ANGLE_RANGE.min, Math.round(parsedValue))));
	}

	function handleTrigger() {
		void triggerMutation.mutateAsync(currentCommand);
	}

	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-8">
				<header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="flex flex-col gap-3">
						<Badge variant="outline" className="gap-1 font-mono tracking-[0.18em] uppercase">
							<SquareTerminalIcon data-icon="inline-start" />
							Developer Demo
						</Badge>
						<div className="flex flex-col gap-2">
							<h1 className="text-3xl font-semibold tracking-tight">Dispenser Control Console</h1>
							<p className="text-muted-foreground max-w-2xl text-sm leading-6">
								Issue one feeder action at a time, watch the server relay posture, and keep livestream viewing separate
								from motor control.
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<Button type="button" variant="outline" onClick={handleManualRefresh}>
							{statusQuery.isFetching ? (
								<Spinner data-icon="inline-start" />
							) : (
								<RefreshCcwIcon data-icon="inline-start" />
							)}
							Refresh Status
						</Button>
						<Button asChild variant="outline">
							<Link to="/_demo/livestream">
								<ArrowUpRightIcon data-icon="inline-start" />
								Open Livestream
							</Link>
						</Button>
					</div>
				</header>

				<section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
					<Card className="border-border/70 from-background via-background to-muted/40 gap-4 bg-gradient-to-br">
						<CardHeader className="gap-3">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="flex flex-col gap-1">
									<CardTitle>Relay posture</CardTitle>
									<CardDescription>
										Short acknowledgement flow only. The request returns after publish-and-wait, not after full motor
										completion.
									</CardDescription>
								</div>
								<Badge variant={getResultBadgeVariant(status?.latestKnownDeviceState.state ?? "unknown")}>
									{connectivityLabel}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="grid gap-4 lg:grid-cols-3">
							<div className="border-border/70 bg-background/70 rounded-xl border p-4">
								<p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Device</p>
								<p className="mt-2 font-mono text-lg font-medium">{status?.deviceId ?? "feeder-1"}</p>
								<p className="text-muted-foreground mt-1 text-sm">Targeted from app-server via MQTT.</p>
							</div>
							<div className="border-border/70 bg-background/70 rounded-xl border p-4">
								<p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Broker link</p>
								<p className="mt-2 text-lg font-medium">{status?.broker.connected ? "Connected" : "Disconnected"}</p>
								<p className="text-muted-foreground mt-1 truncate font-mono text-xs">
									{status?.broker.url ?? "Loading..."}
								</p>
							</div>
							<div className="border-border/70 bg-background/70 rounded-xl border p-4">
								<p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">Latest device state</p>
								<div className="mt-2 flex items-center gap-2">
									<Badge variant={getResultBadgeVariant(status?.latestKnownDeviceState.state ?? "unknown")}>
										{status?.latestKnownDeviceState.state ?? "unknown"}
									</Badge>
									{status?.latestKnownDeviceState.busy ? <Badge variant="outline">busy</Badge> : null}
								</div>
								<p className="text-muted-foreground mt-1 text-sm">
									{status?.latestKnownDeviceState.message ?? "Waiting for retained status or the first device event."}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border/70 bg-muted/30">
						<CardHeader>
							<CardTitle>Transport summary</CardTitle>
							<CardDescription>Server topics and acknowledgement envelope for this demo target.</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3 text-sm">
							<div className="border-border/70 bg-background/70 flex flex-col gap-1 rounded-lg border p-3">
								<FieldTitle className="font-mono text-xs tracking-[0.16em] uppercase">command</FieldTitle>
								<p className="font-mono text-xs break-all">{status?.broker.commandTopic ?? "pakamew/devices/..."}</p>
							</div>
							<div className="border-border/70 bg-background/70 flex flex-col gap-1 rounded-lg border p-3">
								<FieldTitle className="font-mono text-xs tracking-[0.16em] uppercase">status</FieldTitle>
								<p className="font-mono text-xs break-all">{status?.broker.statusTopic ?? "pakamew/devices/..."}</p>
							</div>
							<div className="border-border/70 bg-background/70 flex flex-col gap-1 rounded-lg border p-3">
								<FieldTitle className="font-mono text-xs tracking-[0.16em] uppercase">events</FieldTitle>
								<p className="font-mono text-xs break-all">{status?.broker.eventsTopic ?? "pakamew/devices/..."}</p>
							</div>
						</CardContent>
					</Card>
				</section>

				{statusAlert ? (
					<Alert variant={triggerMutation.data?.result === "error" || statusQuery.error ? "destructive" : "default"}>
						<TriangleAlertIcon />
						<AlertTitle>{statusAlert.title}</AlertTitle>
						<AlertDescription>{statusAlert.description}</AlertDescription>
					</Alert>
				) : null}

				<section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
					<Card className="border-border/70">
						<CardHeader>
							<CardTitle>Control surface</CardTitle>
							<CardDescription>
								Intent: a bench operator needs one clear action path, visible limits, and immediate busy/offline
								feedback.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-6">
							<FieldGroup>
								<Field>
									<FieldTitle>Command mode</FieldTitle>
									<FieldContent>
										<ToggleGroup
											id="mode-toggle"
											type="single"
											variant="outline"
											size="sm"
											value={mode}
											onValueChange={(value) => {
												if (value === "duration" || value === "angle") {
													setMode(value);
												}
											}}>
											<ToggleGroupItem value="duration">
												<Clock3Icon data-icon="inline-start" />
												Timed feed
											</ToggleGroupItem>
											<ToggleGroupItem value="angle">
												<RadioIcon data-icon="inline-start" />
												Angle control
											</ToggleGroupItem>
										</ToggleGroup>
										<FieldDescription>
											Timed feed is the primary action. Angle mode stays available for manual or calibration-style
											testing.
										</FieldDescription>
									</FieldContent>
								</Field>

								<Separator />

								{mode === "duration" ? (
									<>
										<Field>
											<FieldLabel htmlFor="duration-input">Gate open duration</FieldLabel>
											<FieldContent>
												<div className="grid gap-4 lg:grid-cols-[1fr_8rem] lg:items-center">
													<Slider
														min={status?.limits.duration.min ?? DURATION_RANGE.min}
														max={status?.limits.duration.max ?? DURATION_RANGE.max}
														step={100}
														value={[durationMs]}
														onValueChange={(value) => setDurationMs(value[0] ?? DURATION_RANGE.defaultValue)}
													/>
													<Input
														id="duration-input"
														type="number"
														min={status?.limits.duration.min ?? DURATION_RANGE.min}
														max={status?.limits.duration.max ?? DURATION_RANGE.max}
														step={100}
														value={durationMs}
														onChange={(event) => handleDurationInputChange(event.target.value)}
													/>
												</div>
												<FieldDescription>
													Valid range: {status?.limits.duration.min ?? DURATION_RANGE.min} to{" "}
													{status?.limits.duration.max ?? DURATION_RANGE.max} ms.
												</FieldDescription>
											</FieldContent>
										</Field>
									</>
								) : (
									<Field>
										<FieldLabel htmlFor="angle-input">Dispense angle</FieldLabel>
										<FieldContent>
											<div className="grid gap-4 lg:grid-cols-[1fr_8rem] lg:items-center">
												<Slider
													min={status?.limits.angle.min ?? ANGLE_RANGE.min}
													max={status?.limits.angle.max ?? ANGLE_RANGE.max}
													step={1}
													value={[angle]}
													onValueChange={(value) => setAngle(value[0] ?? ANGLE_RANGE.defaultValue)}
												/>
												<Input
													id="angle-input"
													type="number"
													min={status?.limits.angle.min ?? ANGLE_RANGE.min}
													max={status?.limits.angle.max ?? ANGLE_RANGE.max}
													step={1}
													value={angle}
													onChange={(event) => handleAngleInputChange(event.target.value)}
												/>
											</div>
											<FieldDescription>
												Valid range: {status?.limits.angle.min ?? ANGLE_RANGE.min} to{" "}
												{status?.limits.angle.max ?? ANGLE_RANGE.max} degrees.
											</FieldDescription>
										</FieldContent>
									</Field>
								)}
							</FieldGroup>
						</CardContent>
						<CardFooter className="flex flex-col items-stretch gap-3 border-t">
							<Button type="button" size="lg" disabled={submitDisabled} onClick={handleTrigger}>
								{triggerMutation.isPending ? (
									<Spinner data-icon="inline-start" />
								) : (
									<SendHorizonalIcon data-icon="inline-start" />
								)}
								{mode === "duration" ? `Send T${durationMs}` : `Send A${angle}`}
							</Button>
							<p className="text-muted-foreground text-sm">
								{deviceBusy
									? "The device has marked itself busy, so new commands are rejected instead of queued."
									: "The server returns after the first acknowledgement. Completion continues asynchronously on the device."}
							</p>
						</CardFooter>
					</Card>

					<Card className="border-border/70">
						<CardHeader>
							<CardTitle>Latest command</CardTitle>
							<CardDescription>
								Most recent relay attempt observed by this browser session or the server cache.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-4 text-sm">
							{lastCommand ? (
								<>
									<div className="flex flex-wrap items-center gap-2">
										<Badge variant={getResultBadgeVariant(lastCommand.result)}>{lastCommand.result}</Badge>
										{lastCommand.acknowledgementState ? (
											<Badge variant="outline">{lastCommand.acknowledgementState}</Badge>
										) : null}
									</div>

									<div className="grid gap-3 sm:grid-cols-2">
										<div className="border-border/70 bg-muted/30 rounded-lg border p-3">
											<p className="text-muted-foreground font-mono text-[11px] tracking-[0.16em] uppercase">
												request id
											</p>
											<p className="mt-1 font-mono text-xs break-all">{lastCommand.requestId}</p>
										</div>
										<div className="border-border/70 bg-muted/30 rounded-lg border p-3">
											<p className="text-muted-foreground font-mono text-[11px] tracking-[0.16em] uppercase">command</p>
											<p className="mt-1 font-mono text-xs">
												{lastCommand.mode === "angle"
													? `A${lastCommand.angle ?? ANGLE_RANGE.defaultValue}`
													: `T${lastCommand.openDurationMs ?? DURATION_RANGE.defaultValue}`}
											</p>
										</div>
									</div>

									<div className="border-border/70 bg-background/60 rounded-lg border p-3">
										<p className="text-muted-foreground font-mono text-[11px] tracking-[0.16em] uppercase">message</p>
										<p className="mt-1 leading-6">
											{lastCommand.message ?? "No additional message was attached to the last command."}
										</p>
									</div>
								</>
							) : (
								<div className="border-border/70 bg-muted/20 rounded-xl border border-dashed p-4">
									<p className="font-medium">No command sent yet</p>
									<p className="text-muted-foreground mt-1">
										Send a timed or angle-based request to populate the relay summary and device acknowledgement fields.
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</section>
			</div>
		</div>
	);
}
