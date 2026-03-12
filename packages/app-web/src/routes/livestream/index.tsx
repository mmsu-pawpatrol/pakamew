import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LivestreamPlayer } from "@/lib/livestream";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChatPanel } from "./-chat-panel";
import { EventsPanel } from "./-events-panel";

export const Route = createFileRoute("/livestream/")({
	component: LivestreamPage,
});

function LivestreamPage() {
	return (
		<main className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-stretch lg:py-6">
			<section className="shrink-0 bg-black lg:flex lg:min-h-0 lg:flex-col lg:bg-transparent lg:px-6">
				<header className="hidden items-center justify-between gap-4 lg:flex">
					<div className="flex flex-col gap-1">
						<p className="text-muted-foreground text-sm">Live Shelter Feed</p>
						<h1 className="text-2xl font-semibold tracking-tight">MMSU CCIS Station</h1>
					</div>

					<div className="flex items-center gap-2">
						<ThemeToggleButton />

						<Button asChild variant="ghost" size="icon-lg" className="rounded-full p-0">
							<Link to="/profile" aria-label="Open profile">
								<Avatar size="lg">
									<AvatarFallback>PA</AvatarFallback>
								</Avatar>
							</Link>
						</Button>
					</div>
				</header>

				<div className="mx-auto w-full max-w-[min(100%,52.267dvh)] lg:mx-0 lg:flex lg:min-h-0 lg:max-w-none lg:flex-1 lg:items-center">
					<div className="relative w-full overflow-hidden lg:rounded-xl">
						<AspectRatio ratio={4 / 3} className="bg-muted relative">
							<LivestreamPlayer alt="Livestream from shelter camera" className="h-full w-full" />
						</AspectRatio>
					</div>
				</div>
			</section>

			<section className="min-h-0 flex-1 overflow-hidden lg:flex lg:min-h-0 lg:flex-col lg:self-stretch lg:pt-0">
				<Tabs defaultValue="chat" className="h-full min-h-0 gap-0 overflow-hidden">
					<TabsList
						variant="line"
						className="w-full shrink-0 rounded-none border-b pt-1 group-data-horizontal/tabs:h-11">
						<TabsTrigger value="chat" className="h-8">
							Live Chat
						</TabsTrigger>
						<TabsTrigger value="events" className="h-8">
							Events
						</TabsTrigger>
					</TabsList>

					<TabsContent value="chat" className="min-h-0 flex-1 overflow-hidden sm:px-6">
						<ChatPanel />
					</TabsContent>
					<TabsContent value="events" className="min-h-0 flex-1 overflow-hidden sm:px-6">
						<EventsPanel />
					</TabsContent>
				</Tabs>
			</section>
		</main>
	);
}
