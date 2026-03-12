import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UserRoundIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	return (
		<main className="mx-auto flex h-full w-full max-w-3xl px-4 py-10 sm:px-6">
			{/* Accessible page heading for screen readers */}
			<h1 className="sr-only">Profile</h1>
			{/* Placeholder state until account features are integrated */}
			<Empty className="border-border bg-card">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<UserRoundIcon />
					</EmptyMedia>
					<EmptyTitle>Profile Page Placeholder</EmptyTitle>
					<EmptyDescription>
						Account and profile settings are not wired yet. This route is ready for the upcoming auth integration.
					</EmptyDescription>
				</EmptyHeader>
				{/* Quick navigation actions */}
				<EmptyContent className="sm:flex-row sm:justify-center">
					<Button asChild>
						<Link to="/">Back to Homepage</Link>
					</Button>
					<Button asChild variant="outline">
						<Link to="/livestream">Open Live Stream</Link>
					</Button>
				</EmptyContent>
			</Empty>
		</main>
	);
}
